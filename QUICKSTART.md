# SanctionX - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+
- Python 3.9+
- Firebase account
- Git

### 1. Clone & Install

```bash
# Frontend dependencies
cd landing_page
npm install

# Backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Enable Cloud Storage
5. Download serviceAccountKey.json → place in `backend/` folder
6. Copy your Firebase config to `landing_page/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Firestore Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Deploy rules
firebase deploy --only firestore:rules
```

### 4. Start Development

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd landing_page
npm run dev
```

Visit http://localhost:3000

## 📱 Test the Flow

1. **Homepage** → http://localhost:3000
2. **Login/Register** → Click "Start Loan Journey" → Go to `/auth`
3. **Complete Signup** → Follow 5-step wizard at `/signup`
4. **Loan Application** → Chat flow at `/dashboard`
5. **Admin Dashboard** → http://localhost:3000/admin/applications

## 🧪 Test Credentials

```
Email: test@example.com
Password: Test@1234567
```

## 📝 Key Files

| File | Purpose |
|------|---------|
| `/auth/page.tsx` | Login/Signup split card |
| `/signup/page.tsx` | 5-step stepper wizard |
| `/dashboard/page.tsx` | Chat-based loan flow |
| `/admin/applications/page.tsx` | Admin dashboard |
| `lib/firebase-config.ts` | Firebase initialization |
| `lib/auth.ts` | Authentication functions |
| `lib/auth-context.tsx` | Auth state management |

## 🔗 API Endpoints

### User
- `POST /api/user/register` - Register user
- `GET /api/user/{user_id}` - Get profile

### Loan
- `POST /api/loan/create-application` - Create loan app
- `POST /api/loan/check-eligibility` - Check eligibility
- `POST /api/loan/check-fraud` - Fraud detection
- `POST /api/loan/generate-sanction-letter` - Generate PDF

### Admin
- `GET /api/admin/all-applications` - List applications
- `POST /api/admin/approve-application/{user_id}` - Approve
- `POST /api/admin/reject-application/{user_id}` - Reject

## 🔒 Security

✅ Firebase Auth protects routes
✅ Firestore rules enforce user scoping
✅ Documents stored in Cloud Storage
✅ Sensitive data masked in admin views
✅ Audit logging for all decisions

## 🐛 Troubleshooting

### "Cannot find module 'firebase'"
```bash
cd landing_page
npm install firebase
```

### "Firebase config not working"
- Check `.env.local` variables
- Verify Firebase project settings
- Clear browser cache and try again

### Backend connection fails
```bash
# Check if backend is running
curl http://localhost:8000/docs
```

### Firestore rules error
```bash
# Deploy rules again
firebase deploy --only firestore:rules
```

## 📚 Full Documentation

See `IMPLEMENTATION.md` for complete architecture, database schema, endpoints, and deployment guide.

## 🎯 Next Steps

1. ✅ Test complete signup flow
2. ✅ Test loan application chat
3. ✅ Test admin approval workflow
4. ✅ Configure email sender (SMTP)
5. ✅ Setup production database
6. ✅ Deploy to production

## 💡 Tips

- Use Browser DevTools → Application → Local Storage to see auth tokens
- Check Firebase Console → Firestore for saved data
- Check Firebase Console → Authentication for created users
- All validation errors show on the UI
- Draft saves automatically after each step

## ❓ Support

For issues or questions, check:
1. Browser console for errors (F12)
2. Backend logs (terminal window)
3. Firebase Console for data issues
4. Documentation files (IMPLEMENTATION.md)
