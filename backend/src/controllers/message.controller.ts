import { Request, Response } from 'express';
import { VisitorMessage } from '../models/message.model';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const messages = await VisitorMessage.find({ username }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', statusCode: 500 });
  }
};

export const postMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const { content } = req.body;
    if (!content || content.length > 60) {
      res.status(400).json({ error: 'Content is required and must be 60 characters or less', statusCode: 400 });
      return;
    }
    const message = new VisitorMessage({ username, content });
    await message.save();
    res.json({ id: message._id, content: message.content, createdAt: message.createdAt });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', statusCode: 500 });
  }
};
