# SanctionX - Complete Implementation Guide

## Overview
This document describes the complete implementation of the SanctionX loan application platform with auth flow, signup wizard, loan processing, and admin dashboard.

## Architecture

### Frontend (Next.js - landing_page folder)
- **Landing Page** (`/`) - Unchanged, existing UI
- **Auth Page** (`/auth`) - Split card login/signup
- **Signup Stepper** (`/signup`) - 5-step wizard
- **Dashboard** (`/dashboard`) - Chat-based loan flow
- **Admin Dashboard** (`/admin/applications`) - Application management

### Backend (FastAPI - backend folder)
- **Authentication** - Firebase Auth integration
- **Loan Processing** - Eligibility, fraud checks, document verification
- **Database** - Firestore for user profiles and applications
- **Email** - Sanction letter delivery

### Database (Firestore)
- Users collection with KYC and profile data
- Applications subcollection for loan tracking
- Documents subcollection for file storage
- Admin collection for admin operations

## Authentication Flow

### Step 1: Register/Login
- User navigates to `/auth`
- Split card design: Login on left, Signup on right
- Firebase Authentication handles credentials
- User redirected to `/signup` after registration

### Step 2: Signup Stepper (5 Steps)

**Step 1 - Basic Details**
- Full Name (required)
- Date of Birth (required, auto-calculates age, min 18)
- Age (auto-calculated, read-only)
- Gender (dropdown)
- Mobile Number (10 digits)
- Email (validated)
- Saves to Firestore users/{id}/draft

**Step 2 - KYC Verification**
- PAN Number (10 chars, forced uppercase)
- PAN Document Upload
- Aadhaar Number (12 digits)
- Aadhaar Document Upload
- Aadhaar eKYC verification button
- Sets kycVerified = true

**Step 3 - Employment**
- Employment Type (Salaried/Self-employed)
- Conditional fields:
  - Salaried: Workplace + Address
  - Self-employed: Business Name + Registration
- Monthly Income (required)
- Employment Document Upload

**Step 4 - Income OCR**
- Upload salary slip/bank statement
- Backend OCR extraction
- Income verification
- Fraud flag if mismatch > 30%

**Step 5 - Account & Consent**
- Bank Account Number
- IFSC Code
- Password & Confirm Password
- Consent Checkbox (required)
- Triggers:
  - fraud_agent check
  - eligibility_engine
  - Profile finalization

## Loan Application Flow

### Dashboard Chat Page (`/dashboard`)

The chat-based loan wizard asks users sequentially:
1. **Loan Purpose** - What is the loan for?
2. **Loan Amount** - How much money needed?
3. **Payee** - Who is the payee?
4. **Payment Deadline** - When do you need it?
5. **Tenure** - Preferred tenure in months?

### Loan Options Cards
After user answers all questions:
- Calculate 3 loan options with different rates/tenures
- Display cards with:
  - Principal Amount
  - Interest Rate
  - Tenure
  - EMI
  - Total Payable
- "Select Option" button triggers KFS

### Key Fact Statement (KFS)
- Mandatory review screen
- Shows loan summary
- Checkbox: "I accept KFS and agree to proceed"
- Must be accepted before sanction

### Sanction Letter
- Auto-generated PDF after KFS acceptance
- Includes:
  - Name
  - DOB
  - Loan Amount
  - Purpose
  - Tenure
  - Rate
  - Approval Date
  - Bank Signature
  - Branch visit instruction
- Email delivery to user

### Status Tracker
Timeline shows:
1. Documents Verified ✓
2. Risk Review ✓
3. Approved ✓
4. Letter Generated ✓

## Admin Dashboard (`/admin/applications`)

### Table Display
Columns:
- Name
- Email
- Monthly Income
- Documents Verified (checkmark/cross)
- Fraud Flag (yes/warning)
- Risk Level (low/medium/high)
- Status (Pending/Approved/Rejected)
- Actions (Approve/Reject buttons)

### Summary Cards
- Total Approved
- Total Rejected
- Fraud Flags Count
- Average Income

### Actions
- Approve Application
- Reject Application with reason
- View detailed application

## Backend Endpoints

### User Management
```
POST   /api/user/register          # Register new user
POST   /api/user/complete-kyc      # Complete KYC
GET    /api/user/{user_id}         # Get user profile
PUT    /api/user/{user_id}         # Update profile
```

### Loan Processing
```
POST   /api/loan/create-application              # Create app
POST   /api/loan/check-eligibility               # Check eligibility
POST   /api/loan/check-fraud                     # Fraud detection
POST   /api/loan/generate-sanction-letter        # Generate PDF
POST   /api/loan/send-sanction-email             # Send email
POST   /api/loan/update-status                   # Update status
GET    /api/loan/application-status/{user_id}   # Get status
```

### Admin Endpoints
```
GET    /api/admin/all-applications               # List all apps
POST   /api/admin/approve-application/{user_id}  # Approve
POST   /api/admin/reject-application/{user_id}   # Reject
```

### Document Processing
```
POST   /api/documents/upload         # Upload document
POST   /api/documents/ocr            # Extract text (OCR)
GET    /api/documents/{doc_id}       # Retrieve document
```

## Security Implementation

### Firebase Authentication
- Email/Password authentication
- Session persistence
- Auth state management via context
- Protected routes (redirect to /auth if not authenticated)

### Firestore Security Rules
```firestore
// Users can only read/write their own documents
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Applications are user-scoped
match /users/{userId}/applications/{appId} {
  allow read, write: if request.auth.uid == userId;
}

// Admin only access
match /admin/{document=**} {
  allow read, write: if hasRole(request.auth.uid, 'admin');
}
```

### Data Protection
- PAN masked except last 4 digits in admin view
- Aadhaar masked except last 4 digits
- Consent logging for audit trail
- KFS acceptance required and logged
- Fraud flags logged with reasons

## File Structure

### Frontend
```
landing_page/
├── app/
│   ├── auth/page.tsx                    # Auth split card
│   ├── signup/page.tsx                  # 5-step stepper
│   ├── dashboard/page.tsx               # Chat loan flow
│   ├── admin/applications/page.tsx      # Admin table
│   └── layout.tsx                       # With AuthProvider
├── lib/
│   ├── firebase-config.ts               # Firebase init
│   ├── auth.ts                          # Auth functions
│   ├── auth-context.tsx                 # Auth provider
│   └── utils.ts
├── components/
│   └── ui/                              # Reusable components
└── public/
```

### Backend
```
backend/
├── routes/
│   └── loan_routes.py                   # Loan endpoints
├── agents/
│   ├── eligibility_engine.py            # Eligibility checks
│   ├── fraud_agent.py                   # Fraud detection
│   ├── sanction_letter.py               # PDF generation
│   └── email_agent.py                   # Email sending
├── utils/
│   └── firebase_helper.py               # Firestore operations
├── main.py                              # FastAPI app
└── requirements.txt
```

## Setup Instructions

### 1. Environment Setup
```bash
# Frontend
cd landing_page
cp .env.local.example .env.local
# Update with your Firebase credentials

# Backend
cd backend
pip install -r requirements.txt
# Configure Firebase serviceAccountKey.json
```

### 2. Firebase Setup
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Cloud Storage
5. Download serviceAccountKey.json
6. Add to backend folder

### 3. Configure Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Start Services
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd landing_page
npm run dev
```

## Testing

### Test Scenarios

1. **Complete Signup Flow**
   - Register → Step 1-5 → Dashboard

2. **Loan Application**
   - Dashboard → Answer questions → Loan options → KFS → Sanction

3. **Admin Approval**
   - Admin page → Approve/Reject applications

4. **Error Handling**
   - Invalid age (< 18)
   - Invalid email
   - Mismatched passwords
   - Missing files
   - Fraud detection

## Deployment

### Frontend (Vercel)
```bash
cd landing_page
vercel deploy
```

### Backend (Cloud Run/EC2)
```bash
cd backend
gcloud run deploy sanctionx-backend
```

## Compliance & Security

✅ Firebase Authentication for secure auth
✅ Firestore user-scoped security rules
✅ Private document storage
✅ PAN masked except last 4 digits
✅ Aadhaar masked except last 4 digits
✅ Consent and KFS acceptance required
✅ Fraud detection integrated
✅ Email verification for communication
✅ Audit logging of all decisions
✅ RBI-aligned loan processing

## Support & Maintenance

### Monitoring
- Firebase Console for auth/database
- Cloud Logging for backend
- Error tracking and alerting

### Updates
- Regularly update dependencies
- Review and update security rules
- Monitor fraud patterns
- Adjust eligibility criteria

## License & Terms
All code is proprietary to SanctionX. Unauthorized copying or distribution is prohibited.
