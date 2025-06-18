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

    const linkResponses: LinkResponse[] = links.map((link) => ({
      id: link._id.toString(),
      title: link.title,
      url: link.url,
      enabled: link.enabled,
      order: link.order,
      isTemporary: link.isTemporary,
      clicks: link.clicks,
    }));

    res.status(200).json(linkResponses);
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
    const { title, url, enabled, isTemporary }: CreateLinkRequest = req.body;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
      return;
    }

    // Get the next order number
    const lastLink = await Link.findOne({ userId }).sort({ order: -1 });
    const nextOrder = lastLink ? lastLink.order + 1 : 1;

    const newLink = new Link({
      userId,
      title,
      url,
      enabled,
      isTemporary,
      order: nextOrder,
    });

    await newLink.save();

    const linkResponse: LinkResponse = {
      id: newLink._id.toString(),
      title: newLink.title,
      url: newLink.url,
      enabled: newLink.enabled,
      order: newLink.order,
      isTemporary: newLink.isTemporary,
      clicks: newLink.clicks,
    };

    res.status(201).json(linkResponse);
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

    // Update all links with new order and content
    const updatePromises = links.map(async (linkData) => {
      return await Link.findOneAndUpdate(
        { _id: linkData.id, userId },
        {
          title: linkData.title,
          url: linkData.url,
          enabled: linkData.enabled,
          order: linkData.order,
          isTemporary: linkData.isTemporary,
        },
        { new: true }
      );
    });

    const updatedLinks = await Promise.all(updatePromises);

    // Filter out null results and format response
    const validLinks = updatedLinks.filter((link) => link !== null);

    const linkResponses: LinkResponse[] = validLinks.map((link) => ({
      id: link!._id.toString(),
      title: link!.title,
      url: link!.url,
      enabled: link!.enabled,
      order: link!.order,
      isTemporary: link!.isTemporary,
      clicks: link!.clicks,
    }));

    res.status(200).json(linkResponses);
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
      res.status(404).json({
        error: 'Link not found',
        message: 'Link does not exist or does not belong to user',
      });
      return;
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete link',
    });
  }
};
