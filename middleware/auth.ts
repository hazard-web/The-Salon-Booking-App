import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role?: string;
                [key: string]: any;
            };
        }
    }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('Request Headers:', req.headers); 
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { [key: string]: any; id: string };
        req.user = decoded; 

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

const roleMiddleware = (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => {
    // Added a check to ensure `req.user` is defined
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not found.' });
    }

    // Check if the user's role matches the required role
    if (req.user.role !== requiredRole) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }

    // Proceed to the next middleware or route handler
    next();
};

export { authMiddleware, roleMiddleware };
