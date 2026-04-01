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
import { isReservedUsername } from '../utils/reservedUsernames.js';
import {
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/auth.types.js';
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from '../utils/passwordReset.utils.js';
import { sendBrevoEmail } from '../utils/email.utils.js';

const PASSWORD_RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

function getFrontendBaseUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

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

    if (isReservedUsername(username)) {
      res.status(400).json({
        error: 'Validation error',
        message: 'This username is reserved',
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

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email }: ForgotPasswordRequest = req.body;

    const genericResponse = {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(200).json(genericResponse);
      return;
    }

    const { token, tokenHash } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    user.passwordResetRequestedAt = new Date();
    await user.save();

    const resetUrl = `${getFrontendBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;

    const safeDisplayName = user.displayName || user.username || 'there';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Reset your LinkFolio password</h2>
        <p>Hi ${safeDisplayName},</p>
        <p>We received a request to reset your password. This link is valid for 15 minutes.</p>
        <p>
          <a
            href="${resetUrl}"
            style="display:inline-block;padding:10px 16px;background:#ec5c33;color:#fff;text-decoration:none;border-radius:8px;"
          >
            Reset password
          </a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    const textContent = `Reset your LinkFolio password. Open this link within 15 minutes: ${resetUrl}`;

    try {
      await sendBrevoEmail({
        toEmail: user.email,
        toName: user.displayName || user.username,
        subject: 'Reset your LinkFolio password',
        htmlContent,
        textContent,
      });
    } catch (emailError) {
      user.passwordResetTokenHash = null;
      user.passwordResetExpiresAt = null;
      user.passwordResetRequestedAt = null;
      await user.save();
      next(emailError instanceof Error ? emailError : new Error('Failed to send password reset email'));
      return;
    }

    res.status(200).json(genericResponse);
  } catch (error) {
    if (error instanceof Error) {
      next(error);
      return;
    }
    next(new AppError('Failed to start password reset', 500));
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password }: ResetPasswordRequest = req.body;

    const tokenHash = hashPasswordResetToken(token);

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        error: 'Invalid reset token',
        message: 'Reset token is invalid or expired',
      });
      return;
    }

    user.password = await hashPassword(password);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    user.passwordResetRequestedAt = null;
    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    if (error instanceof Error) {
      next(error);
      return;
    }
    next(new AppError('Failed to reset password', 500));
  }
};
