interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private requests = new Map<string, RateLimitEntry>();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 10;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Clean up expired entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const entry = this.requests.get(ip);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.WINDOW_MS,
      };
      this.requests.set(ip, newEntry);
      return { allowed: true, resetTime: newEntry.resetTime };
    }

    // Check if under limit
    if (entry.count < this.MAX_REQUESTS) {
      entry.count++;
      return { allowed: true, resetTime: entry.resetTime };
    }

    // Rate limit exceeded
    return { allowed: false, resetTime: entry.resetTime };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();
