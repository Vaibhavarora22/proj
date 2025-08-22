// Load environment variables
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
// Add other routes here (e.g., classRoutes, attendanceRoutes)

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// API Routes
app.get('/api', (req, res) => {
    res.send('Study Platform API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Use other routes here

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});