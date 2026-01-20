const { ROLES } = require('../config/constants');

/**
 * Middleware to check if user has required role(s)
 * @param {Array|String} allowedRoles - Single role or array of allowed roles
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = checkRole(ROLES.ADMIN);

/**
 * Middleware to check if user is business user
 */
const isBusinessUser = checkRole(ROLES.BUSINESS_USER);

/**
 * Middleware to check if user is investor
 */
const isInvestor = checkRole(ROLES.INVESTOR);

/**
 * Middleware to check if user is business user or admin
 */
const isBusinessOrAdmin = checkRole([ROLES.BUSINESS_USER, ROLES.ADMIN]);

module.exports = {
    checkRole,
    isAdmin,
    isBusinessUser,
    isInvestor,
    isBusinessOrAdmin
};
