import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Link } from '../models/link.model.js';
import { VisitorMessage } from '../models/message.model.js';
import { ClickEvent } from '../models/clickEvent.model.js';

dotenv.config();

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  return uri;
}

async function checkIndexes(): Promise<void> {
  const mongoUri = getMongoUri();
  await mongoose.connect(mongoUri, { autoIndex: true });

  try {
    // Ensure models are initialized so schema indexes are materialized.
    await Promise.all([
      User.init(),
      Link.init(),
      VisitorMessage.init(),
      ClickEvent.init(),
    ]);

    const collections = [
      { name: 'users', model: User },
      { name: 'links', model: Link },
      { name: 'visitormessages', model: VisitorMessage },
      { name: 'clickevents', model: ClickEvent },
    ] as const;

    for (const collection of collections) {
      const indexes = await collection.model.collection.indexes();
      console.log(`\n=== ${collection.name} ===`);
      console.log(JSON.stringify(indexes, null, 2));
    }
  } finally {
    await mongoose.disconnect();
  }
}

checkIndexes()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    if (error instanceof Error) {
      console.error('Failed to check indexes:', error.message);
      console.error(error.stack);
    } else {
      console.error('Failed to check indexes:', error);
    }
    process.exit(1);
  });
