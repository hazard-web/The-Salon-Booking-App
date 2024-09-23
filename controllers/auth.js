const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
  
exports.loginPage = async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "../", "public", "views", "login.html"));
    } catch {
        (err) => console.log(err);
    }
};

// Controller for user registration
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    // Basic input validation
    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate email format (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
        });

        console.log('New user created:', newUser);


        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error); // Log error for internal tracking
        res.status(500).json({ error: 'An error occurred during registration. Please try again later.' });
    }
};

// Controller for user login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare provided password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const authToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send token and role in the response
        res.json({
            authToken, 
            role: user.role
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

