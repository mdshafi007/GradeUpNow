/**
 * Middleware to check if user is a student
 * Must be used after authMiddleware
 */
const isStudent = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is student
    if (req.userRole !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student privileges required.'
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

module.exports = isStudent;
