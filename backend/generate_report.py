import os
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch

def generate_report():
    output_filename = "SanctionX_Project_Report.pdf"
    doc = SimpleDocTemplate(output_filename, pagesize=LETTER)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1, # Center
        textColor=colors.HexColor("#1e293b")
    )
    
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=18,
        spaceBefore=20,
        spaceAfter=12,
        textColor=colors.HexColor("#2563eb")
    )
    
    body_style = styles['BodyText']
    
    elements = []

    # Title Page
    elements.append(Spacer(1, 2*inch))
    elements.append(Paragraph("SanctionX Project Report", title_style))
    elements.append(Paragraph("AI-Powered Digital Loan Assistant", styles['Heading3']))
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph("Comprehensive Technical & Market Analysis", body_style))
    elements.append(PageBreak())

    # 1. Executive Summary
    elements.append(Paragraph("1. Executive Summary", section_style))
    elements.append(Paragraph(
        "SanctionX is a state-of-the-art AI-powered digital loan officer designed to streamline the personal loan application process. "
        "By integrating advanced OCR, fraud detection, and automated credit assessment, it reduces the sanction time from days to minutes. "
        "The platform ensures RBI compliance while providing a premium, user-centric experience.",
        body_style
    ))

    # 2. Technology Stack
    elements.append(Paragraph("2. Technology Stack", section_style))
    tech_data = [
        ["Component", "Technology", "Description"],
        ["Frontend", "Next.js 16, React 19", "Modern, high-performance UI framework"],
        ["Backend", "FastAPI (Python)", "High-performance asynchronous API layer"],
        ["Database", "Supabase / PostgreSQL", "Real-time data management with robust schema"],
        ["Security", "Firebase Auth / Supabase Auth", "Secure user authentication and session management"],
        ["OCR Engine", "Tesseract / OpenCV", "Automated extraction of data from documents"],
        ["Logic/Agents", "Custom Python Agents", "Modular agents for Fraud, Eligibility, and KFS generation"],
        ["Styling", "Tailwind CSS 4", "Custom-themed dark mode and premium aesthetics"]
    ]
    
    t = Table(tech_data, colWidths=[1.5*inch, 2*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.2*inch))

    # 3. Core Features
    elements.append(Paragraph("3. Core Features", section_style))
    features = [
        "<b>Smart Signup Wizard:</b> A 5-step multi-step form with real-time validation and auto-save.",
        "<b>AI Chat Assistant:</b> A conversational interface that guides users through the loan process.",
        "<b>Automated OCR:</b> Real-time extraction of income and PAN/Aadhaar details from uploaded documents.",
        "<b>Fraud Detection:</b> Integrated risk engine that checks for multiple PAN entries and income discrepancies.",
        "<b>Instant Sanction Letter:</b> Dynamic PDF generation of sanction letters and Key Fact Statements (KFS).",
        "<b>Admin Dashboard:</b> Comprehensive view for manual review and bulk application management."
    ]
    for feature in features:
        elements.append(Paragraph(f"• {feature}", body_style))
        elements.append(Spacer(1, 0.05*inch))

    # 4. Problem Identification & Solution
    elements.append(Paragraph("4. Problem & Solution", section_style))
    elements.append(Paragraph("<b>The Problem:</b>", body_style))
    elements.append(Paragraph(
        "Traditional loan processes are plagued by long wait times, excessive paperwork, and manual verification errors. "
        "Customers often face uncertainty during the approval process, leading to a poor user experience.",
        body_style
    ))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("<b>The SanctionX Solution:</b>", body_style))
    elements.append(Paragraph(
        "SanctionX digitizes the entire journey. By using AI to verify identity and income instantly, "
        "it eliminates bottlenecks. The chat-based interface makes the process interactive and transparent, "
        "delivering a decision in under 5 minutes.",
        body_style
    ))

    # 5. Market & Customer Dynamics
    elements.append(Paragraph("5. Market & Customer Dynamics", section_style))
    elements.append(Paragraph("<b>Target Audience:</b>", body_style))
    elements.append(Paragraph(
        "Tech-savvy millennials, salaried professionals, and micro-entrepreneurs who require quick access to credit without the hassle of visiting a bank branch.",
        body_style
    ))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("<b>Market Opportunity:</b>", body_style))
    elements.append(Paragraph(
        "The Digital Lending market in India is expected to reach $350 Billion by 2026. "
        "SanctionX positions itself as a 'Digital Direct' platform, reducing customer acquisition costs for lenders by automating the top-of-the-funnel qualification.",
        body_style
    ))

    # 6. Why Use SanctionX? (Value Prop)
    elements.append(Paragraph("6. Why This App is Needed", section_style))
    elements.append(Paragraph(
        "For Users: Speed, transparency, and a friction-less mobile-first experience. "
        "For Institutions: Lower operational costs, reduced fraud risk, and higher conversion rates through automated processing.",
        body_style
    ))

    doc.build(elements)
    print(f"Report generated successfully: {output_filename}")

if __name__ == "__main__":
    generate_report()
