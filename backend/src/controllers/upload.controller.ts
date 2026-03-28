import { Response } from 'express';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { AuthRequest } from '../middleware/index.js';
import { User } from '../models/user.model.js';

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      error: 'Validation error',
      message: 'No file uploaded',
    });
    return;
  }

  if (!req.user?.userId) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'User not authenticated',
    });
    return;
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'linkfolio/avatars');

    await User.findByIdAndUpdate(
      req.user.userId,
      { avatarUrl: result.secure_url },
      { new: true }
    );

    res.status(200).json({ avatarUrl: result.secure_url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload image',
    });
  }
};