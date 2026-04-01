import crypto from 'crypto';

const RESET_TOKEN_BYTES = 32;

export function createPasswordResetToken(): {
  token: string;
  tokenHash: string;
} {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = hashPasswordResetToken(token);

  return {
    token,
    tokenHash,
  };
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
