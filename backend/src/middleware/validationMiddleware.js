// Example of a simple validation middleware.
// For a real app, use a robust library like express-validator.
const validateRegistration = (req, res, next) => {
    const { email, password, role, profile } = req.body;

    if (!email || !password || !role || !profile) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Add more validation as needed...

    next();
};

module.exports = {
    validateRegistration,
};