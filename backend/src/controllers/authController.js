// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (or Admin, depending on app rules)
 */
const register = async (req, res) => {
    const { email, password, role, profile } = req.body;

    // Basic validation
    if (!email || !password || !role || !profile || !profile.firstName || !profile.lastName) {
        return res.status(400).json({ message: 'Please provide all required fields: email, password, role, and profile with firstName and lastName.' });
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Create user in the database
        const newUser = await userModel.createUser(email, passwordHash, role, profile);

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

/**
 * @desc    Authenticate a user and get a token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find user by email
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare provided password with the stored hash
        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Create JWT payload
        const payload = {
            id: user.user_id,
            email: user.email,
            role: user.role_name,
        };

        // Sign the token
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        });

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role_name,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = {
    register,
    login,
};
