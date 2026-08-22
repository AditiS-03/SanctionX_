import pytesseract
from PIL import Image
import re
import cv2
import numpy as np

# Windows path (adjust if needed)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text_from_image(image_path: str) -> str:
    """
    Extract raw OCR text from image with advanced preprocessing for precision.
    """
    img = cv2.imread(image_path)
    if img is None:
        return ""

    # 1. Resize 1.5x for better small text detection
    height, width = img.shape[:2]
    img = cv2.resize(img, (int(width * 1.5), int(height * 1.5)), interpolation=cv2.INTER_CUBIC)

    # 2. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Denoise BEFORE thresholding (crucial for clarity)
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

    # 4. Apply adaptive thresholding
    processed = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    pil_img = Image.fromarray(processed)

    # Use PSM 3 (Auto Page Segmentation) for structured documents
    # Removed whitelist to avoid missing characters Tesseract might read differently
    custom_config = r'--oem 3 --psm 3'
    
    text = pytesseract.image_to_string(pil_img, config=custom_config)
    
    # Fallback to PSM 6 if PSM 3 is too sparse
    if len(text.strip()) < 10:
        text = pytesseract.image_to_string(pil_img, config='--oem 3 --psm 6')
        
    return text


def extract_income(text: str):
    # (Kept for compatibility, mostly focusing on logic improvements in extract_details)
    return None

def extract_details(text: str):
    """
    Highly robust extraction logic for proof documents.
    """
    cleaned = text.upper()
    
    details = {
        "amount_numeric": 0,
        "amount_words": 0,
        "payee": "",
        "signature_detected": False,
        "integrity_check": "FAILED",
        "amount_match": False,
        "valid": False,
        "raw_words": ""
    }

    # 1. PAYEE EXTRACTION (Near keywords)
    payee_keywords = ["PAY TO", "BILL TO", "BENEFICIARY", "SELLER", "VEND", "RECEIVED FROM", "FOR"]
    for kw in payee_keywords:
        pat = rf"{kw}\s*[:\-]?\s*([A-Z\s\.]{3,40})"
        match = re.search(pat, cleaned)
        if match:
            payee = match.group(1).strip()
            payee = re.split(r'\n|AMOUNT|DATE|GST|PAN|RS|RUPEES', payee)[0].strip()
            if len(payee) > 3:
                details["payee"] = payee
                break

    # 2. NUMERIC AMOUNT EXTRACTION (Multi-stage recovery)
    candidates = [] # List of (value, score, label)
    
    # Heuristic scoring - Prioritize Balance/Remaining for matching
    labels = {
        "BALANCE": 10, "REMAINED": 10, "REMAINING": 10, "OUTSTANDING": 10, "PAYABLE": 8,
        "TOTAL": 5, "GRAND": 5, "SUM": 4, "AMOUNT": 3, "PROPERTY": 2, "VALUE": 2, "DUES": 2
    }

    # Stage A: Flexible Keyword Search
    # Pattern: [KEYWORD] ... [:] ... [SYMBOL] ... NUMBER
    # Prefix is now optional (re-finding all numbers and scoring them)
    raw_num_matches = re.finditer(r"(?:([A-Z\s]{2,30})[:\-]?\s*)?(?:(?:RS\.?|RUPEES|INR|₹|2|7)\s*)?([0-9,]{5,12})(?:\.[0-9]{2})?", cleaned)
    for match in raw_num_matches:
        prefix = (match.group(1) or "").strip()
        raw_val = match.group(2).replace(",", "")
        try:
            val = int(float(raw_val))
            score = 1
            is_balance_candidate = False
            for kw, s in labels.items():
                if kw in prefix: 
                    score += s
                    if s >= 10: is_balance_candidate = True
            
            if 10000 <= val <= 99000000:
                candidates.append((val, score, prefix or "GENERAL", is_balance_candidate))
                
            # Recovery for leading '2' or '7' applied to ALL finds
            if len(raw_val) > 5 and raw_val[0] in '27Z?':
                recovered = int(float(raw_val[1:]))
                if 10000 <= recovered <= 99000000:
                    candidates.append((recovered, score + 1, f"REC_{prefix or 'GENERAL'}", is_balance_candidate))
        except: pass

    # Stage B: Strict Symbol Match (High confidence symbols)
    strict_matches = re.finditer(r"(?:₹|INR|RS\.?|RUPEES)\s*([0-9,]{5,12})", cleaned)
    for match in strict_matches:
        try:
            raw_val = match.group(1).replace(",", "")
            val = int(float(raw_val))
            if 10000 <= val <= 99000000: candidates.append((val, 5, "STRICT_SYMBOL", False))
        except: pass

    # Stage C: Loose Catch-all (Last resort if nothing else found)
    if not candidates:
        loose_matches = re.finditer(r"([1-9][0-9,]{4,10})(?:\.[0-9]{2})?", cleaned)
        for match in loose_matches:
            try:
                raw_val = match.group(1).replace(",", "")
                val = int(raw_val)
                if 10000 <= val <= 99000000: candidates.append((val, 0, "LOOSE_MATCH", False))
            except: pass

    # 3. AMOUNT IN WORDS
    word_amount, raw_words = extract_amount_from_words_v2(cleaned)
    details["amount_words"] = word_amount
    details["raw_words"] = raw_words

    # Pick best candidate
    best_tuple = None
    if candidates:
        # If words found, prioritize those that match words
        if word_amount > 0:
            matches_words = [c for c in candidates if abs(c[0] - word_amount) <= (word_amount * 0.1)]
            if matches_words:
                best_tuple = max(matches_words, key=lambda x: x[1])
            else:
                # If no word match, use heuristic (could be Balance vs Total mismatch)
                best_tuple = max(candidates, key=lambda x: x[1])
        else:
            # No words, just pick highest scored
            best_tuple = max(candidates, key=lambda x: x[1])

    if best_tuple:
        details["amount_numeric"] = best_tuple[0]
        details["is_balance"] = best_tuple[3]
        details["label_detected"] = best_tuple[2]
    else:
        # ABSOLUTE FALLBACK: If word_amount exists but no numeric candidate was found in regex stages,
        # Trust the word_amount for detection display (better than ₹0)
        if word_amount > 10000:
            details["amount_numeric"] = word_amount
            details["label_detected"] = "FROM_WORDS"

    # 4. VALIDATION & INTEGRITY
    if int(details["amount_numeric"] or 0) > 0:
        val_num = int(details["amount_numeric"])
        val_words = int(details["amount_words"])
        
        # If words found, match them. 
        if val_words > 0:
            diff = abs(val_num - val_words)
            limit = val_num * 0.1 # 10% tolerance
            if diff <= limit:
                details["amount_match"] = True
                details["integrity_check"] = "PASSED"
            else:
                # If numeric is "Balance" and words were "Total", we don't fail integrity,
                # we just note words refer to something else.
                details["amount_match"] = True if details.get("is_balance") else False
                details["integrity_check"] = "PASSED (Balance Priority)" if details.get("is_balance") else "FAILED"
        else:
            details["amount_match"] = True 
            details["integrity_check"] = "PARTIAL (No Words)"

    # Signature checks
    sig_keywords = ["SIGNATURE", "AUTH", "SD/-", "SIGNATORY", "MANAGER", "AUTHORIZED", "STAMP", "SEAL"]
    if any(k in cleaned for k in sig_keywords):
        details["signature_detected"] = True

    # Final overall validity
    if int(details["amount_numeric"] or 0) > 0 and details.get("signature_detected"):
        details["valid"] = True

    return details


def extract_amount_from_words_v2(text: str):
    """
    Robust word-to-number conversion.
    """
    # Pre-clean common OCR errors and formatting
    cleaned = text.replace("TTIES", "RUPEES").replace("ONEY", "ONLY").replace("LAKH S", "LAKHS").replace("RUPES", "RUPEES")
    
    # Simple word to num mapping
    units = {
        "ZERO": 0, "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5, "SIX": 6, "SEVEN": 7, "EIGHT": 8, "NINE": 9,
        "TEN": 10, "ELEVEN": 11, "TWELVE": 12, "THIRTEEN": 13, "FOURTEEN": 14, "FIFTEEN": 15, "SIXTEEN": 16,
        "SEVENTEEN": 17, "EIGHTEEN": 18, "NINETEEN": 19, "TWENTY": 20, "THIRTY": 30, "FORTY": 40, "FIFTY": 50,
        "SIXTY": 60, "SEVENTY": 70, "EIGHTY": 80, "NINETY": 90
    }
    multipliers = {
        "HUNDRED": 100, "THOUSAND": 1000, "LAKH": 100000, "LAKHS": 100000, "CRORE": 10000000, "CRORES": 10000000
    }

    # Extract the string segment between "RUPEES" and "ONLY" or "AND"
    res = re.search(r"RUPEES\s+(.*?)\s+(?:ONLY|AND|/-)", cleaned)
    if not res:
        res = re.search(r"AMOUNT\s+IN\s+WORDS\s*[:\-]?\s*(.*?)\s+(?:ONLY|AND|/-)", cleaned)
    if not res:
        # Fallback to loose extraction of any number-words followed by ONLY
        res = re.search(r"([A-Z\s]+?)\s+ONLY", cleaned)
    
    if not res:
        return 0, ""

    words_segment = res.group(1).strip()
    words = words_segment.split()
    
    total = 0
    current = 0
    for w in words:
        w = w.strip("., ")
        if w in units:
            current += units[w]
        elif w in multipliers:
            if current == 0: current = 1
            total += current * multipliers[w]
            current = 0
    
    total += current
    return total, words_segment.title()
