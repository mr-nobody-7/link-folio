import { z } from 'zod';

export const createLinkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  isTemporary: z.boolean().optional().default(false),
});

export const updateLinksSchema = z.object({
  links: z.array(
    z.object({
      _id: z.string().min(1),
      title: z.string().min(1).max(100),
      url: z.string().url(),
      enabled: z.boolean(),
      order: z.number().int().min(0),
      isTemporary: z.boolean().optional(),
    })
  ),
});
