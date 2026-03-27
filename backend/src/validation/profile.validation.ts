import { z } from 'zod';
import { isReservedUsername } from '../utils/reservedUsernames.js';

export const updateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
  theme: z.string().max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/)
    .refine((val) => !isReservedUsername(val), {
      message: 'This username is reserved',
    })
    .optional(),
});
