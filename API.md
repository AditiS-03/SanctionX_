# SanctionX API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All endpoints requiring authentication use Firebase ID tokens in the `Authorization` header:
```
Authorization: Bearer {firebase_id_token}
```

---

## User Management Endpoints

### Register User
**POST** `/api/user/register`

Create a new user profile.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile": "9876543210",
  "age": 25,
  "gender": "Male",
  "pan": "ABCDE1234F",
  "aadhaar": "123456789012",
  "employment_type": "salaried",
  "monthly_income": 50000
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "user_123",
  "message": "User registered successfully"
}
```

### Get User Profile
**GET** `/api/user/{user_id}`

Retrieve user profile information.

**Response:**
```json
{
  "uid": "user_123",
  "email": "john@example.com",
  "fullName": "John Doe",
  "dob": "1998-01-15",
  "age": 25,
  "gender": "Male",
  "mobile": "9876543210",
  "pan": "ABCDE****",
  "aadhaar": "123456****",
  "kycVerified": true,
  "employmentType": "salaried",
  "monthlyIncome": 50000,
  "eligible": true,
  "createdAt": "2024-02-01T10:00:00Z"
}
```

### Update User Profile
**PUT** `/api/user/{user_id}`

Update user information.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "monthlyIncome": 55000,
  "bankAccount": "1234567890",
  "ifsc": "SBIN0001234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

## Loan Processing Endpoints

### Create Loan Application
**POST** `/api/loan/create-application`

Create a new loan application.

**Request Body:**
```json
{
  "user_id": "user_123",
  "loan_purpose": "Home renovation",
  "loan_amount": 500000,
  "payee": "XYZ Contractor",
  "payment_deadline": "2024-03-15",
  "tenure_months": 24
}
```

**Response:**
```json
{
  "success": true,
  "application_id": "current",
  "message": "Application created successfully"
}
```

### Check Eligibility
**POST** `/api/loan/check-eligibility`

Check if user is eligible for the requested loan.

**Request Body:**
```json
{
  "user_id": "user_123",
  "monthly_income": 50000,
  "loan_amount": 500000,
  "existing_debt": 100000
}
```

**Response:**
```json
{
  "eligible": true,
  "max_loan_amount": 600000,
  "reason": "Monthly income meets minimum requirement"
}
```

### Check Fraud
**POST** `/api/loan/check-fraud`

Run fraud detection checks.

**Request Body:**
```json
{
  "user_id": "user_123",
  "pan": "ABCDE1234F",
  "aadhaar": "123456789012",
  "income_declared": 50000
}
```

**Response:**
```json
{
  "fraud_detected": false,
  "risk_score": 15,
  "reason": "All checks passed"
}
```

### Generate Sanction Letter
**POST** `/api/loan/generate-sanction-letter`

Generate PDF sanction letter for approved loan.

**Query Parameters:**
- `user_id` (required): User ID

**Response:**
```json
{
  "success": true,
  "pdf_path": "/documents/sanction_user_123.pdf",
  "message": "Sanction letter generated"
}
```

### Send Sanction Email
**POST** `/api/loan/send-sanction-email`

Send sanction letter via email.

**Query Parameters:**
- `user_id` (required): User ID

**Response:**
```json
{
  "success": true,
  "message": "Sanction letter sent to john@example.com"
}
```

### Update Application Status
**POST** `/api/loan/update-status`

Update application status.

**Query Parameters:**
- `user_id` (required): User ID
- `status` (required): Status value (`docs_verified`, `risk_review`, `approved`, `rejected`)

**Response:**
```json
{
  "success": true,
  "message": "Status updated to approved"
}
```

### Get Application Status
**GET** `/api/loan/application-status/{user_id}`

Get current application status.

**Response:**
```json
{
  "status": "approved",
  "documents_verified": true,
  "fraud_flag": false,
  "eligible": true,
  "created_at": "2024-02-01T10:00:00Z",
  "updated_at": "2024-02-05T15:30:00Z"
}
```

---

## Admin Endpoints

### Get All Applications
**GET** `/api/admin/all-applications`

List all loan applications (Admin only).

**Response:**
```json
{
  "total": 42,
  "applications": [
    {
      "user_id": "user_123",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "loan_amount": 500000,
      "loan_purpose": "Home renovation",
      "status": "pending",
      "documents_verified": true,
      "fraud_flag": false,
      "risk_score": 15,
      "created_at": "2024-02-01T10:00:00Z"
    }
  ]
}
```

### Approve Application
**POST** `/api/admin/approve-application/{user_id}`

Approve a loan application.

**Response:**
```json
{
  "success": true,
  "message": "Application approved for John Doe"
}
```

### Reject Application
**POST** `/api/admin/reject-application/{user_id}`

Reject a loan application.

**Query Parameters:**
- `reason` (optional): Rejection reason

**Response:**
```json
{
  "success": true,
  "message": "Application rejected"
}
```

---

## Document Endpoints

### Upload Document
**POST** `/api/documents/upload`

Upload a document (PAN, Aadhaar, income proof, etc.).

**Form Data:**
- `user_id` (required): User ID
- `doc_type` (required): Document type (`pan`, `aadhaar`, `salary_slip`, `bank_statement`)
- `file` (required): File to upload (PDF, JPG, PNG)

**Response:**
```json
{
  "success": true,
  "document_id": "doc_123",
  "file_path": "documents/user_123/pan_123.pdf",
  "message": "Document uploaded successfully"
}
```

### Extract Text (OCR)
**POST** `/api/documents/ocr`

Extract text from document using OCR.

**Request Body:**
```json
{
  "document_id": "doc_123"
}
```

**Response:**
```json
{
  "success": true,
  "extracted_text": "Name: John Doe\nIncome: ₹50000\n...",
  "income": 50000,
  "confidence": 0.95
}
```

### Retrieve Document
**GET** `/api/documents/{doc_id}`

Get document details.

**Response:**
```json
{
  "document_id": "doc_123",
  "user_id": "user_123",
  "doc_type": "pan",
  "file_path": "documents/user_123/pan_123.pdf",
  "uploaded_at": "2024-02-01T10:00:00Z",
  "verified": true
}
```

---

## Chat Endpoints

### Send Message
**POST** `/chat`

Send message in loan chat flow.

**Request Body:**
```json
{
  "session_id": "user_123_session",
  "message": "I need a loan of 500000 rupees"
}
```

**Response:**
```json
{
  "reply": "Great! How much tenure would you prefer?",
  "next_step": "tenure",
  "loan_options": null
}
```

### Get Chat History
**GET** `/chat/{session_id}`

Get chat message history.

**Response:**
```json
{
  "session_id": "user_123_session",
  "messages": [
    {
      "role": "bot",
      "text": "Hi! How can I help you?"
    },
    {
      "role": "user",
      "text": "I need a loan"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "detail": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

- 100 requests per minute per user
- 1000 requests per minute per IP

---

## Pagination

For list endpoints, use query parameters:
```
GET /api/admin/all-applications?skip=0&limit=10
```

---

## Testing with cURL

### Create User
```bash
curl -X POST http://localhost:8000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobile": "9876543210",
    "age": 25
  }'
```

### Create Loan Application
```bash
curl -X POST http://localhost:8000/api/loan/create-application \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": "user_123",
    "loan_purpose": "Home renovation",
    "loan_amount": 500000,
    "tenure_months": 24
  }'
```

### Get Admin Applications
```bash
curl -X GET http://localhost:8000/api/admin/all-applications \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Webhook Events

(Optional) Subscribe to events:
```
POST /webhooks/subscribe
{
  "event": "application.approved",
  "webhook_url": "https://your-domain.com/webhook"
}
```

Events:
- `application.created`
- `application.approved`
- `application.rejected`
- `sanction_letter.generated`
- `sanction_letter.sent`

---

## Version

Current API Version: **1.0.0**

Last Updated: February 2025
