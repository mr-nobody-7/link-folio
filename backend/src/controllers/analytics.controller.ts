import { Request, Response } from 'express';
import { Link } from '../models/link.model';
import { User } from '../models/user.model';

export const linkClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { linkId, username, referrer } = req.body;
    const link = await Link.findById(linkId);
    if (!link) {
      res.status(404).json({ error: 'Link not found', statusCode: 404 });
      return;
    }
    link.clicks = (link.clicks || 0) + 1;
    await link.save();
    // Optionally, store analytics data (e.g., referrer, username)
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', statusCode: 500 });
  }
};

export const profileView = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, referrer } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found', statusCode: 404 });
      return;
    }
    user.views = (user.views || 0) + 1;
    await user.save();
    // Optionally, store analytics data (e.g., referrer)
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', statusCode: 500 });
  }
};
