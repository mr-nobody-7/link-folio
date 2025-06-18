import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { AuthRequest } from '../middleware/index.js';

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    // Finding user by username
    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({
        error: 'Profile not found',
        message: 'User with this username does not exist',
      });
      return;
    }

    // Increment views (simple analytics)
    user.views = (user.views || 0) + 1;
    await user.save();

    // Return profile data (excluding password)
    const profileData = {
      id: user._id.toString(),
      username: user.username,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      links: [],
      views: user.views,
      joinedAt: user.joinedAt.toISOString(),
      theme: user.theme || 'default',
    };

    res.status(200).json(profileData);
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

    // Check if username is taken by another user
    if (username) {
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

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(theme && { theme }),
        ...(displayName !== undefined && { displayName }),
      },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        error: 'User not found',
        message: 'User does not exist',
      });
      return;
    }

    const profileData = {
      id: updatedUser._id.toString(),
      username: updatedUser.username,
      bio: updatedUser.bio || '',
      avatarUrl: updatedUser.avatarUrl || '',
      theme: updatedUser.theme || 'default',
      displayName: updatedUser.displayName || '',
      email: updatedUser.email,
      joinedAt: updatedUser.joinedAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile',
    });
  }
};
