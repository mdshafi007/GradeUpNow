import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

/**
 * 🔥 WORLD-CLASS FIREBASE ADMIN CONFIGURATION
 * Best practices: Error handling, logging, environment detection
 * Supports both development and production environments
 */

class FirebaseAdminManager {
  constructor() {
    this.isInitialized = false;
    this.auth = null;
    this.db = null;
  }

  /**
   * Initialize Firebase Admin SDK with comprehensive error handling
   */
  async initialize() {
    try {
      // Prevent multiple initializations
      if (this.isInitialized && admin.apps.length > 0) {
        console.log('🔥 Firebase Admin already initialized');
        return this.getServices();
      }

      const environment = process.env.NODE_ENV || 'development';
      console.log(`🚀 Initializing Firebase Admin for ${environment} environment`);

      // Try service account key first (production)
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
      
      if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
        await this.initializeWithServiceAccount(serviceAccountPath);
      } else {
        await this.initializeWithProjectId();
      }

      // Get services
      this.auth = admin.auth();
      this.db = admin.firestore();
      this.isInitialized = true;

      console.log('✅ Firebase Admin SDK initialized successfully');
      await this.validateConnection();
      
      return this.getServices();

    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
  }

  /**
   * Initialize with service account key file
   */
  async initializeWithServiceAccount(serviceAccountPath) {
    const absolutePath = path.resolve(serviceAccountPath);
    const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    
    console.log(`🔐 Initialized with service account for project: ${serviceAccount.project_id}`);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  /**
   * Initialize with project ID (fallback for development)
   */
  async initializeWithProjectId() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('Firebase configuration missing: No service account key or project ID found');
    }

    console.log(`🔐 Initialized with project ID: ${projectId}`);
    
    admin.initializeApp({
      projectId: projectId,
    });
  }

  /**
   * Validate Firebase connection
   */
  async validateConnection() {
    try {
      // Test Auth connection
      await admin.auth().listUsers(1);
      console.log('✅ Firebase Auth connection validated');

      // Test Firestore connection
      await admin.firestore().collection('_test').limit(1).get();
      console.log('✅ Firestore connection validated');
      
    } catch (error) {
      console.warn('⚠️  Firebase connection validation failed:', error.message);
    }
  }

  /**
   * Get Firebase services
   */
  getServices() {
    return {
      auth: this.auth,
      db: this.db,
      admin: admin
    };
  }
}

// Create singleton instance
const firebaseManager = new FirebaseAdminManager();

// Initialize Firebase Admin (called once)
const initializeFirebaseAdmin = async () => {
  return await firebaseManager.initialize();
};

// Export the manager and initialization function
export { firebaseManager, initializeFirebaseAdmin };

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
