import { Request, Response } from 'express';
import { Link } from '../models/link.model.js';
import { AuthRequest } from '../middleware/index.js';
import { CreateLinkRequest, LinkResponse } from '../types/link.types.js';

export const getLinks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const links = await Link.find({ userId }).sort({ order: 1 });

    res.status(200).json(links);
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch links',
    });
  }
};

export const createLink = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, url, isTemporary, expiresAt }: CreateLinkRequest = req.body;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    if (!title || !url) {
      res.status(400).json({
        error: 'Validation error',
        message: 'title and url are required',
      });
      return;
    }

    const linksCount = await Link.countDocuments({ userId });
    const order = linksCount + 1;

    const temporary = Boolean(isTemporary);
    let resolvedExpiresAt: Date | null = null;

    if (temporary) {
      if (expiresAt) {
        const parsedExpiry = new Date(expiresAt);
        if (Number.isNaN(parsedExpiry.getTime())) {
          res.status(400).json({
            error: 'Validation error',
            message: 'expiresAt must be a valid datetime',
          });
          return;
        }
        resolvedExpiresAt = parsedExpiry;
      } else {
        resolvedExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    }

    const newLink = new Link({
      userId,
      title,
      url,
      enabled: true,
      order,
      isTemporary: temporary,
      expiresAt: temporary ? resolvedExpiresAt : null,
    });

    await newLink.save();

    res.status(201).json(newLink);
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create link',
    });
  }
};

export const updateLinks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { links }: { links: LinkResponse[] } = req.body;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    if (!Array.isArray(links)) {
      res.status(400).json({
        error: 'Validation error',
        message: 'links array is required',
      });
      return;
    }

    const updatePromises = links.map(async (linkData) => {
      return await Link.findOneAndUpdate(
        { _id: (linkData as any)._id, userId },
        {
          title: (linkData as any).title,
          url: (linkData as any).url,
          enabled: (linkData as any).enabled,
          order: (linkData as any).order,
          isTemporary: (linkData as any).isTemporary,
        },
        { new: true }
      );
    });

    const updatedLinks = await Promise.all(updatePromises);

    res.status(200).json(updatedLinks);
  } catch (error) {
    console.error('Update links error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update links',
    });
  }
};

export const deleteLink = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { linkId } = req.params;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    const deletedLink = await Link.findOneAndDelete({
      _id: linkId,
      userId,
    });

    if (!deletedLink) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }

    res.status(200).json({ message: 'Link deleted' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete link',
    });
  }
};
