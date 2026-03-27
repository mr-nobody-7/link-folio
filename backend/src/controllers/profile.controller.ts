import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { Link } from '../models/link.model.js';
import { AuthRequest } from '../middleware/index.js';
import { isReservedUsername } from '../utils/reservedUsernames.js';

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const links = await Link.find({ userId: user._id, enabled: true }).sort({
      order: 1,
    });

    user.views = (user.views || 0) + 1;
    await user.save();

    res.status(200).json({
      user: {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        theme: user.theme,
        views: user.views,
      },
      links,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile',
    });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { username, bio, avatarUrl, theme, displayName } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
      return;
    }

    if (username !== undefined && username !== user.username) {
      if (username && isReservedUsername(username)) {
        res.status(400).json({
          error: 'Validation error',
          message: 'This username is reserved',
        });
        return;
      }

      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        res.status(400).json({
          error: 'Username taken',
          message: 'This username is already taken',
        });
        return;
      }
    }

    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (theme !== undefined) user.theme = theme;
    if (displayName !== undefined) user.displayName = displayName;

    await user.save();

    const updatedUserObject = user.toObject();
    const { password, ...safeUser } = updatedUserObject;

    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile',
    });
  }
};
