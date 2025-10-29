/**
 * Middleware to check if user is an admin
 * Must be used after authMiddleware
 */
const isAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin or super_admin
    if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed',
      error: error.message
    });
  }
};

module.exports = isAdmin;
