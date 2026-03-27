import cron from 'node-cron';
import { Link } from '../models/link.model.js';

export function startExpireLinksJob() {
  const task = cron.schedule('0 * * * *', async () => {
    try {
      const result = await Link.updateMany(
        {
          isTemporary: true,
          enabled: true,
          expiresAt: { $lte: new Date() },
        },
        {
          $set: { enabled: false },
        }
      );

      console.log(
        `[expireLinks] Expired ${result.modifiedCount} links at ${new Date().toISOString()}`
      );
    } catch (error) {
      console.error('[expireLinks] Failed to expire links:', error);
    }
  });

  console.log('[expireLinks] Job scheduled (0 * * * *)');
  return task;
}
