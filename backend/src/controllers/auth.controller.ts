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

    if (!email || !username || !password || !displayName) {
      res.status(400).json({
        error: 'Validation error',
        message: 'email, username, password and displayName are required',
      });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(409).json({
        message: 'Email or username already taken',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      username,
      password: hashedPassword,
      displayName,
    });

    await user.save();

    const token = generateToken({
      userId: user._id as unknown as string,
      email: user.email,
      username: user.username,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    });
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

    if (!email || !password) {
      res.status(400).json({
        error: 'Validation error',
        message: 'email and password are required',
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken({
      userId: user._id as unknown as string,
      email: user.email,
      username: user.username,
    });

    res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login',
    });
  }
};
