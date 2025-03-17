import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default cache TTL: 24 hours in milliseconds
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000;

// Simple cache service for API responses and computed values

type CacheEntry = {
  value: any;
  expiry: number | null; // null means no expiry
};

class CacheService {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number = 1000 * 60 * 5; // 5 minutes default TTL

  constructor() {
    this.cache = new Map();
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    // If entry doesn't exist or has expired
    if (!entry || (entry.expiry !== null && entry.expiry < Date.now())) {
      if (entry) this.cache.delete(key); // Clean up expired entry
      return null;
    }
    
    return entry.value as T;
  }

  // Set a value in cache with optional TTL in milliseconds
  set(key: string, value: any, ttl: number | null = this.defaultTTL): void {
    const expiry = ttl === null ? null : Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  // Remove an item from cache
  remove(key: string): void {
    this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Set default TTL
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

export const cacheService = {
  /**
   * Generate a hash key from content for caching
   */
  generateKey(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  },

  /**
   * Store a response in the cache
   * @param ttlMs Time-to-live in milliseconds (default: 24 hours)
   */
  async cacheResponse(
    prompt: string, 
    response: string, 
    provider: string, 
    model: string, 
    ttlMs: number = DEFAULT_CACHE_TTL
  ): Promise<void> {
    const key = this.generateKey(prompt);
    const expiresAt = new Date(Date.now() + ttlMs);
    
    try {
      // @ts-ignore - Handling dynamic model name
      const llmCacheModel = prisma.LLMCache || prisma.llmCache || prisma.lLMCache || prisma.llmcache;
      
      if (!llmCacheModel) {
        console.error("LLM Cache model not found in Prisma client");
        return;
      }
      
      await llmCacheModel.upsert({
        where: { cacheKey: key },
        update: {
          response,
          provider,
          model,
          updatedAt: new Date(),
          expiresAt
        },
        create: {
          cacheKey: key,
          prompt,
          response,
          provider,
          model,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt
        }
      });
    } catch (error) {
      console.error("Failed to cache LLM response:", error);
      // Non-critical error, don't throw
    }
  },

  /**
   * Get a cached response if available and not expired
   */
  async getCachedResponse(prompt: string): Promise<string | null> {
    const key = this.generateKey(prompt);
    
    try {
      // @ts-ignore - Handling dynamic model name
      const llmCacheModel = prisma.LLMCache || prisma.llmCache || prisma.lLMCache || prisma.llmcache;
      
      if (!llmCacheModel) {
        console.error("LLM Cache model not found in Prisma client");
        return null;
      }
      
      const cached = await llmCacheModel.findFirst({
        where: { 
          cacheKey: key,
          expiresAt: { gt: new Date() } // Only return non-expired cache entries
        }
      });
      
      if (cached) {
        return cached.response;
      }
      
      // Clean up expired cache entries (non-blocking)
      this.cleanExpiredCache().catch(err => 
        console.error("Failed to clean expired cache:", err)
      );
      
      return null;
    } catch (error) {
      console.error("Failed to retrieve cached LLM response:", error);
      return null;
    }
  },
  
  /**
   * Delete expired cache entries
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      // @ts-ignore - Handling dynamic model name
      const llmCacheModel = prisma.LLMCache || prisma.llmCache || prisma.lLMCache || prisma.llmcache;
      
      if (!llmCacheModel) {
        console.error("LLM Cache model not found in Prisma client");
        return;
      }
      
      await llmCacheModel.deleteMany({
        where: { expiresAt: { lt: new Date() } }
      });
    } catch (error) {
      console.error("Failed to clean expired cache:", error);
    }
  }
};

export default cacheService;
