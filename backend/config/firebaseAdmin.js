import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * 🔥 WORLD-CLASS FIREBASE ADMIN CONFIGURATION
 * Best practices: Singleton pattern, error handling, logging, environment detection
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
      } else if (process.env.FIREBASE_PROJECT_ID) {
        await this.initializeWithProjectId();
      } else {
        throw new Error('No Firebase configuration found. Set FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_KEY_PATH');
      }

      // Get services
      this.auth = admin.auth();
      this.db = admin.firestore();
      this.isInitialized = true;

      console.log('✅ Firebase Admin SDK initialized successfully');
      await this.validateConnection();
      
      return this.getServices();

    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error.message);
      throw new Error(`Firebase initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize with service account (production)
   */
  async initializeWithServiceAccount(serviceAccountPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log(`🔐 Initialized with service account for project: ${serviceAccount.project_id}`);
  }

  /**
   * Initialize with project ID (development)
   */
  async initializeWithProjectId() {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'gradeupnow-adfc4';
    admin.initializeApp({
      projectId: projectId
    });
    console.log(`🆔 Initialized with project ID: ${projectId}`);
  }

  /**
   * Validate Firebase connection
   */
  async validateConnection() {
    try {
      // Test auth service
      await this.auth.listUsers(1);
      console.log('✅ Firebase Auth connection validated');
      
      // Test Firestore connection  
      await this.db.collection('_health').limit(1).get();
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

  /**
   * Create user with comprehensive error handling
   */
  async createUser(userData) {
    try {
      const { email, password, displayName, customClaims = {} } = userData;
      
      // Create Firebase user
      const userRecord = await this.auth.createUser({
        email,
        password,
        displayName,
        emailVerified: false
      });

      // Set custom claims if provided
      if (Object.keys(customClaims).length > 0) {
        await this.auth.setCustomUserClaims(userRecord.uid, customClaims);
      }

      console.log(`✅ Created Firebase user: ${email} (UID: ${userRecord.uid})`);
      return {
        success: true,
        uid: userRecord.uid,
        user: userRecord
      };

    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Verify Firebase ID token
   */
  async verifyToken(idToken) {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return {
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        claims: decodedToken
      };
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Delete user with cleanup
   */
  async deleteUser(uid) {
    try {
      await this.auth.deleteUser(uid);
      console.log(`✅ Deleted Firebase user: ${uid}`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to delete user ${uid}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const firebaseManager = new FirebaseAdminManager();

/**
 * 🔥 WORLD-CLASS FIREBASE MIDDLEWARE
 * Comprehensive token verification with detailed error responses
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization header missing or invalid format',
        code: 'NO_AUTH_HEADER'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'ID token missing from Authorization header',
        code: 'NO_ID_TOKEN'
      });
    }

    // Verify token
    const verification = await firebaseManager.verifyToken(idToken);
    
    if (!verification.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: verification.code || 'INVALID_TOKEN'
      });
    }

    // Attach user info to request
    req.user = {
      uid: verification.uid,
      email: verification.email,
      claims: verification.claims
    };

    next();

  } catch (error) {
    console.error('❌ Firebase token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * 🔥 ROLE-BASED ACCESS CONTROL MIDDLEWARE
 * Checks if user has required role/permission
 */
const requireRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'NOT_AUTHENTICATED'
        });
      }

      const userRoles = req.user.claims.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${requiredRoles.join(', ')}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Role verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission verification failed',
        code: 'PERMISSION_ERROR'
      });
    }
  };
};

// Export everything
export {
  firebaseManager,
  verifyFirebaseToken,
  requireRole
};