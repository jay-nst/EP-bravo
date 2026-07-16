const windowMap = new Map<string, number[]>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, timestamps] of windowMap) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      windowMap.delete(key);
    } else {
      windowMap.set(key, valid);
    }
  }
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  cleanup(config.windowMs);

  const cutoff = now - config.windowMs;
  const existing = windowMap.get(key) ?? [];
  const valid = existing.filter((t) => t > cutoff);

  if (valid.length >= config.maxRequests) {
    const oldestInWindow = valid[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + config.windowMs - now,
    };
  }

  valid.push(now);
  windowMap.set(key, valid);

  return {
    allowed: true,
    remaining: config.maxRequests - valid.length,
    resetMs: config.windowMs,
  };
}

export const RATE_LIMITS = {
  chat: { windowMs: 60_000, maxRequests: 10 },
  payment: { windowMs: 60_000, maxRequests: 5 },
  default: { windowMs: 60_000, maxRequests: 30 },
} as const;
