import { Request, Response } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import bcrypt from 'bcryptjs';

export const loginPage = async (req: Request, res: Response): Promise<void> => {
  try {
    res.sendFile(path.join(__dirname, "../public/views/login.html"));
  } catch (err) {
    console.error('Login page error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  console.log('Register endpoint received data:', req.body); // Log incoming request data
  const { username, email, password, role, mobileNumber }: { username: string; email: string; password: string; role: 'Customer' | 'Owner' | 'Admin'; mobileNumber: string } = req.body;

  if (!username || !email || !password || !role || !mobileNumber) {
    console.error('Validation failed: Missing fields'); // Log validation error
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  try {
    const existingUser: IUser[] = await User.findAll();
    console.log('Fetched existing users:', existingUser); // Log fetched users

    const userExists = existingUser.find((user) => user.email === email);
    if (userExists) {
      console.warn('Email already registered:', email); // Log duplicate email
      res.status(400).json({ error: 'Email is already registered.' });
      return;
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully'); // Log password hashing

    const userId = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      mobileNumber
    });

    console.log('User created successfully:', userId); // Log user creation success
    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    console.error('Error during registration process:', err); // Log detailed error
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const users: IUser[] = await User.findAll();
    const user = users.find((user) => user.email === email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const authToken: string = jwt.sign(
      { id: user._id?.toString(), role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      authToken,
      userId: user._id,
      role: user.role,
      message: 'Login successful'
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Login error:', error.message);
    } else {
      console.error('Login error: An unknown error occurred.');
    }
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
