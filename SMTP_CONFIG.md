# ============================================
# SMTP Configuration for SanctionX Backend
# ============================================
# Add these environment variables to your .env file in the backend directory

# Gmail SMTP (Recommended for testing)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-app-specific-password
SENDER_EMAIL=your-gmail@gmail.com

# OR Supabase SMTP (if configured)
# SMTP_SERVER=smtp.supabase.com
# SMTP_PORT=587
# SMTP_USERNAME=your-supabase-project-id
# SMTP_PASSWORD=your-supabase-smtp-password
# SENDER_EMAIL=noreply@your-domain.com

# ============================================
# Setup Instructions
# ============================================

## Option 1: Using Gmail (Quick Setup)
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password
4. Use that as SMTP_PASSWORD
5. Set SMTP_USERNAME to your Gmail address

## Option 2: Using Supabase SMTP
1. Open Supabase Dashboard → Project Settings → Email
2. Copy the SMTP credentials provided
3. Set them in the variables above
4. Note: Supabase free tier has email limits

## Option 3: Using SendGrid (Production)
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=SG.your-sendgrid-api-key
SENDER_EMAIL=noreply@yourdomain.com

## Option 4: Using Mailgun (Production)
SMTP_SERVER=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
SENDER_EMAIL=noreply@your-domain.mailgun.org

# ============================================
# Testing Email Configuration
# ============================================
# Run this Python script to test:

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

try:
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = "your-email@gmail.com"
    msg['Subject'] = "Test Email from SanctionX"
    msg.attach(MIMEText("This is a test email", 'plain'))
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
    print("✓ Email sent successfully!")
except Exception as e:
    print(f"✗ Error: {e}")
