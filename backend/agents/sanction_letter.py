from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors
import datetime
import os

def generate_sanction_letter(profile, loan_option):
    date = datetime.date.today().strftime("%d-%m-%Y")
    pan = profile.get('pan', 'N/A')
    file_name = f"sanction_{pan}_{date}.pdf"
    file_path = os.path.join(os.getcwd(), file_name)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    
    # --- Header ---
    c.setFillColor(colors.HexColor("#003366"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width / 2, height - 0.6 * inch, "SANCTIONX")
    
    c.setFillColor(colors.HexColor("#0066cc"))
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(width / 2, height - 1 * inch, "FINANCIAL SERVICES")
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 9)
    c.drawCentredString(width / 2, height - 1.3 * inch, "Reg Office: 123, Fintech Hub, Cyber City, India")
    c.drawCentredString(width / 2, height - 1.5 * inch, "Email: support@sanctionx.com | Phone: +91-1234567890")
    
    # Separator line
    c.setStrokeColor(colors.HexColor("#0066cc"))
    c.setLineWidth(2)
    c.line(0.5 * inch, height - 1.7 * inch, width - 0.5 * inch, height - 1.7 * inch)
    
    # --- Title ---
    c.setFillColor(colors.HexColor("#003366"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, height - 2.1 * inch, "SANCTION LETTER")
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 10)
    c.drawString(width - 2.5 * inch, height - 2.1 * inch, f"Date: {date}")
    
    # --- Recipient Details ---
    y_pos = height - 2.7 * inch
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1 * inch, y_pos, "TO,")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1.2 * inch, y_pos - 0.3 * inch, profile.get('name', 'Valued Customer'))
    
    c.setFont("Helvetica", 10)
    c.drawString(1.2 * inch, y_pos - 0.55 * inch, f"PAN: {pan}")
    c.drawString(1.2 * inch, y_pos - 0.75 * inch, f"Email: {profile.get('email', 'N/A')}")
    c.drawString(1.2 * inch, y_pos - 0.95 * inch, f"Mobile: {profile.get('mobile', 'N/A')}")
    
    # --- Letter Body ---
    y_pos = height - 3.8 * inch
    c.setFont("Helvetica", 10)
    c.drawString(1 * inch, y_pos, "Dear Customer,")
    
    c.setFont("Helvetica", 10)
    text_lines = [
        "We are pleased to inform you that your loan application has been APPROVED",
        "based on the information and documents provided by you.",
        "",
        "The approved terms and conditions are as follows:"
    ]
    
    y_pos -= 0.3 * inch
    for line in text_lines:
        c.drawString(1 * inch, y_pos, line)
        y_pos -= 0.25 * inch
    
    # --- Loan Details Box ---
    y_box = y_pos - 0.3 * inch
    c.setStrokeColor(colors.HexColor("#0066cc"))
    c.setLineWidth(1.5)
    c.rect(0.8 * inch, y_box - 2.5 * inch, width - 1.6 * inch, 2.5 * inch)
    
    # Box header
    c.setFillColor(colors.HexColor("#0066cc"))
    c.rect(0.8 * inch, y_box - 0.4 * inch, width - 1.6 * inch, 0.35 * inch, fill=True)
    
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(1 * inch, y_box - 0.25 * inch, "LOAN DETAILS")
    
    # Box content
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 10)
    
    loan_amount = loan_option.get('amount', 0)
    tenure = loan_option.get('tenure', 0)
    rate = loan_option.get('rate', 0)
    emi = loan_option.get('emi', 0)
    
    details = [
        (f"Loan Amount Sanctioned:", f"₹ {loan_amount:,.2f}"),
        (f"Interest Rate (P.A.):", f"{rate}%"),
        (f"Loan Tenure:", f"{tenure} Months"),
        (f"Monthly EMI:", f"₹ {emi:,.2f}"),
        (f"Total Amount Payable:", f"₹ {(emi * tenure):,.2f}"),
    ]
    
    y_detail = y_box - 0.75 * inch
    for label, value in details:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(1 * inch, y_detail, label)
        c.setFont("Helvetica", 10)
        c.drawString(3.5 * inch, y_detail, value)
        y_detail -= 0.3 * inch
    
    # --- Conditions ---
    y_pos = y_box - 3 * inch
    c.setFont("Helvetica-Bold", 10)
    c.drawString(1 * inch, y_pos, "CONDITIONS & DISBURSEMENT:")
    
    c.setFont("Helvetica", 9)
    conditions = [
        "• This sanction is subject to final verification of all original documents.",
        "• Please visit our nearest branch with original KYC documents within 7 days.",
        "• Loan will be disbursed to the bank account registered with us.",
        "• Processing charges and insurance as applicable will be deducted.",
        "• This letter is valid for 30 days from the date of issue."
    ]
    
    y_pos -= 0.25 * inch
    for condition in conditions:
        c.drawString(1 * inch, y_pos, condition)
        y_pos -= 0.22 * inch
    
    # --- Footer Section ---
    footer_y = 2 * inch
    
    # Signature line
    c.setLineWidth(1)
    c.line(width - 3 * inch, footer_y, width - 1 * inch, footer_y)
    
    c.setFont("Helvetica", 10)
    c.drawString(width - 2.8 * inch, footer_y - 0.2 * inch, "Authorized Signatory")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(width - 2.8 * inch, footer_y - 0.45 * inch, "SanctionX Credit Team")
    
    c.setFont("Helvetica", 9)
    c.drawString(1 * inch, footer_y - 0.2 * inch, "Generated on:")
    c.drawString(1.6 * inch, footer_y - 0.2 * inch, datetime.date.today().strftime("%d-%m-%Y"))
    
    # Disclaimer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    disclaimer = "This is a computer-generated document and does not require a physical signature."
    c.drawCentredString(width / 2, 0.4 * inch, disclaimer)
    
    c.save()
    return file_path
