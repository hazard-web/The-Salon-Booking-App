const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    console.log('Request Headers:', req.headers); // Log all headers
    // Extract the Authorization header
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);

    // Check if the Authorization header is present
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied: No token provided' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1]; // Split to get the token

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token (user info) to req object

        // Debugging: Log the decoded token for verification
        console.log('Decoded token:', decoded);

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        let message = 'Invalid token';
        if (error instanceof jwt.TokenExpiredError) {
            message = 'Token has expired';
        } else if (error instanceof jwt.JsonWebTokenError) {
            message = 'Invalid token';
        }
        return res.status(401).json({ error: message });
    }
};

// Role-based middleware to check user roles
const roleMiddleware = (requiredRole) => (req, res, next) => {
    console.log(req.user);
    // Check if the user's role matches the required role
    if (req.user.role !== requiredRole) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }

    // Proceed to the next middleware or route handler
    next();
};

module.exports = { authMiddleware, roleMiddleware };
