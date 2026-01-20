const jwt = require('jsonwebtoken');
const models = require('../database/mongodb-schema');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // BYPASS FOR TEST USERS (Business and Investor)
        if (decoded.email === 'business@test.com' ||
            decoded.email === 'investor@test.com' ||
            decoded.userId === '507f1f77bcf86cd799439011' ||
            decoded.userId === '507f1f77bcf86cd799439012') {
            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                passwordUpdated: true
            };
            return next();
        }

        // Fetch user from database to ensure they still exist and are active
        const user = await models.User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive. Please contact support.'
            });
        }

        // Attach user to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            passwordUpdated: user.passwordUpdated
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

/**
 * Middleware to check if password has been updated after first login
 */
const requirePasswordUpdate = (req, res, next) => {
    if (!req.user.passwordUpdated) {
        return res.status(403).json({
            success: false,
            message: 'Password update required',
            requirePasswordUpdate: true
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requirePasswordUpdate
};
