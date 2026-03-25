import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Link } from '../models/link.model.js';
import { User } from '../models/user.model.js';
import { ClickEvent } from '../models/clickEvent.model.js';
import { AuthRequest } from '../middleware/index.js';

export const linkClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { linkId, referrer } = req.body;
    const link = await Link.findById(linkId);
    if (!link) {
      res.status(404).json({ error: 'Link not found', statusCode: 404 });
      return;
    }

    link.clicks = (link.clicks || 0) + 1;
    await link.save();

    try {
      const user = await User.findById(link.userId).select('username');
      if (user?.username) {
        await new ClickEvent({
          linkId: link._id,
          userId: link.userId,
          username: user.username,
          referrer: referrer || '',
        }).save();
      }
    } catch (eventError) {
      console.error('ClickEvent save failed:', eventError);
    }

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

export const getAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', statusCode: 401 });
      return;
    }

    const parsedDays = Number(req.query.days);
    const days = Number.isFinite(parsedDays)
      ? Math.min(Math.max(Math.trunc(parsedDays), 1), 30)
      : 7;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

    const [links, dailyAggregate, todayCount, weekCount] = await Promise.all([
      Link.find({ userId }).select('_id title clicks').sort({ clicks: -1 }),
      ClickEvent.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1,
          },
        },
        { $sort: { date: 1 } },
      ]),
      ClickEvent.countDocuments({
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: startOfToday },
      }),
      ClickEvent.countDocuments({
        userId: new Types.ObjectId(userId),
        createdAt: { $gte: startOfWeek },
      }),
    ]);

    res.status(200).json({
      links,
      daily: dailyAggregate,
      todayCount,
      weekCount,
      days,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', statusCode: 500 });
  }
};
