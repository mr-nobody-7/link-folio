import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/hash.utils.js';
import { generateToken } from '../utils/jwt.utils.js';
import {
  SignupRequest,
  LoginRequest,
  AuthResponse,
} from '../types/auth.types.js';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, displayName }: SignupRequest = req.body;

    // Checking if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({
        error: 'User already exists',
        message: 'Email or username is already taken',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Creating user
    const user = new User({
      email,
      username,
      password: hashedPassword,
      displayName,
    });

    await user.save();

    // Generating token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // Response
    const response: AuthResponse = {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        joinedAt: user.joinedAt.toISOString(),
      },
      token,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'User not found',
      });
      return;
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password',
      });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // Response
    const response: AuthResponse = {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        joinedAt: user.joinedAt.toISOString(),
      },
      token,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login',
    });
  }
};
