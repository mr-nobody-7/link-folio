import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/hash.utils.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/index.js';
import {
  SignupRequest,
  LoginRequest,
} from '../types/auth.types.js';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const accessToken = generateAccessToken({
      userId: user._id as unknown as string,
      email: user.email,
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id as unknown as string,
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    res.status(201).json({
      token: accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      next(error);
      return;
    }
    next(new AppError('Failed to create user', 500));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const accessToken = generateAccessToken({
      userId: user._id as unknown as string,
      email: user.email,
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id as unknown as string,
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh',
    });

    res.status(200).json({
      token: accessToken,
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
    if (error instanceof Error) {
      next(error);
      return;
    }
    next(new AppError('Failed to login', 500));
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken as string | undefined;

    if (!incomingRefreshToken) {
      res.status(401).json({ error: 'No refresh token' });
      return;
    }

    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(incomingRefreshToken);
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      res.status(401).json({ error: 'Refresh token revoked' });
      return;
    }

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.clearCookie('refreshToken', { path: '/auth/refresh' });
    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
