const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user payload to request object
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token.' });
    }
};

// Middleware factory to check for specific roles
const hasRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden. You do not have the required role.' });
        }
        next();
    };
};


module.exports = {
    verifyToken,
    hasRole,
};