import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps.length === 0) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
      
      if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        // Use service account key if available
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        // Initialize with project ID for development
        admin.initializeApp({
          projectId: 'gradeupnow-adfc4'
        });
      }
      
      console.log('Firebase Admin SDK initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
};

// Middleware to verify Firebase ID token
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid authorization token format' 
      });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || decodedToken.displayName,
    };
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

export { initializeFirebaseAdmin };
