import { Redis } from '@upstash/redis';

export interface Email {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
}

// Initialize Redis if environment variables are present
// Supports both the new Upstash integration and the legacy Vercel KV integration
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = redisUrl && redisToken 
  ? new Redis({ url: redisUrl, token: redisToken }) 
  : null;

// Fallback in-memory mock database for local development without env vars
const mockDb: Record<string, Email[]> = {};

export async function getEmails(address: string): Promise<Email[]> {
  if (redis) {
    // Fetch from Redis list
    const emails = await redis.lrange<Email>(`emails:${address}`, 0, -1);
    return emails || [];
  }

  // Fallback
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDb[address] || [];
}

export async function saveEmail(address: string, email: Email): Promise<void> {
  if (redis) {
    // Add to the beginning of the list
    await redis.lpush(`emails:${address}`, email);
    // Keep only the 50 most recent emails for this address
    await redis.ltrim(`emails:${address}`, 0, 49);
    // Set an expiration (TTL) for the address list (e.g., 24 hours = 86400 seconds)
    await redis.expire(`emails:${address}`, 86400);
    return;
  }

  // Fallback
  if (!mockDb[address]) {
    mockDb[address] = [];
  }
  mockDb[address].unshift(email);
  if (mockDb[address].length > 50) {
    mockDb[address].pop();
  }
}

export async function deleteEmail(address: string, id: string): Promise<void> {
  if (redis) {
    // Delete is complex in Redis lists without knowing the exact object.
    // As a simplification for temporary mail, we often don't implement single-delete,
    // or we fetch all, filter, and overwrite. 
    const emails = await getEmails(address);
    const filtered = emails.filter(e => e.id !== id);
    
    // Replace the list
    await redis.del(`emails:${address}`);
    if (filtered.length > 0) {
      // Push in reverse order so the newest is at the top again
      for (let i = filtered.length - 1; i >= 0; i--) {
        await redis.lpush(`emails:${address}`, filtered[i]);
      }
    }
    return;
  }

  // Fallback
  if (mockDb[address]) {
    mockDb[address] = mockDb[address].filter(e => e.id !== id);
  }
}
