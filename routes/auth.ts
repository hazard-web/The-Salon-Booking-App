import express from 'express';
import { loginPage, register, login } from '../controllers/auth';

const authRouter = express.Router();

// Ensure block-scoped variables are declared only once
if (!authRouter) {
  throw new Error('authRouter is not initialized');
}

authRouter.get('/', loginPage);
authRouter.post('/register', register);
authRouter.post('/login', login);

export default authRouter;
