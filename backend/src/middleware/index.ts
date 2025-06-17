import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils.js';
import { User } from '../models/user.model.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'Access denied',
        message: 'No token provided',
      });
      return;
    }

    const decoded = verifyToken(token);

    // Verify user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        error: 'Access denied',
        message: 'User not found',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      error: 'Access denied',
      message: 'Invalid token',
    });
  }
};
