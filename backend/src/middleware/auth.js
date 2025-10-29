/**
 * Verifies Supabase JWT tokens and attaches user info to request
 */

const supabase = require('../config/supabase');

/**
 * Verify JWT token from Supabase and authenticate user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach user info to request object for use in controllers
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email,
      metadata: user.user_metadata
    };

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Optional authentication - doesn't block if no token
 * Useful for routes that work for both auth and non-auth users
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email,
          metadata: user.user_metadata
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue even if auth fails
    next();
  }
};

module.exports = { authenticate, optionalAuth };
