import { z } from 'zod';

export const signupSchema = z.object({
  displayName: z.string().trim().min(1).max(50),
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
