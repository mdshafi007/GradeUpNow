# Firebase Service Account Setup

To enable proper Firebase authentication verification on the backend, you need to:

1. **Generate a Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project "gradeupnow-adfc4"
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Add the Service Account Key:**
   - Save the downloaded JSON file as `backend/config/firebase-service-account.json`
   - Make sure this file is in `.gitignore` (already added)

3. **Alternative for Development:**
   If you don't want to use service account keys locally, you can:
   - Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json`
   - Or use Firebase CLI: `firebase login` and `firebase use gradeupnow-adfc4`

## Current Status:
- ✅ Firebase client-side authentication (unchanged)
- ✅ MongoDB Atlas integration
- ⏳ Backend needs service account key for token verification

## Next Steps:
1. Get the service account key from Firebase Console
2. Place it in `backend/config/firebase-service-account.json`
3. Restart the backend server

The "Invalid or expired token" error will be resolved once the service account key is properly configured.
