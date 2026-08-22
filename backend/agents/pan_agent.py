import re

def handle_pan(session, pan: str):
    pan = pan.strip().upper()

    if not re.match(r"^[A-Z]{5}[0-9]{4}[A-Z]$", pan):
        return "❌ Invalid PAN format. Please enter PAN like ABCDE1234F."

    session["profile"]["pan"] = pan
    session["flags"]["pan_verified"] = True
    session["step"] = "DOCUMENT"

    return "✅ PAN verified successfully. Please upload your income proof document."
