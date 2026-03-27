import { z } from 'zod';
import { isReservedUsername } from '../utils/reservedUsernames.js';

export const signupSchema = z.object({
  displayName: z.string().trim().min(1).max(50),
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/)
    .refine((val) => !isReservedUsername(val), {
      message: 'This username is reserved and cannot be used',
    }),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
