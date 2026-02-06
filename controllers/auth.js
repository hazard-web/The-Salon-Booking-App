const bcrypt = require('bcrypt');  // ✅ bcryptjs (faster)
const path = require('path');
const jwt = require('jsonwebtoken');

// ✅ MongoDB User (no Sequelize)
const User = require('../models/User');

exports.loginPage = async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "../public/views/login.html"));
  } catch (err) {
    console.error('Login page error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ FIXED Registration
exports.register = async (req, res) => {
  const { username, email, password, role, mobilenumber } = req.body;  // ✅ mobilenumber

  // ✅ Basic validation
  if (!username || !email || !password || !role || !mobilenumber) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // ✅ MongoDB findOne (no "where")
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ MongoDB User constructor
    const user = new User(username, email, hashedPassword, mobilenumber, role);
    const userId = await user.save();

    res.status(201).json({ 
      success: true,
      userId,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ✅ FIXED Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ MongoDB findOne (no "where")
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ JWT token with MongoDB _id
    const authToken = jwt.sign(
      { id: user._id.toString(), role: user.role },  // ✅ user._id not user.id
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      authToken,
      userId: user._id,
      role: user.role,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
