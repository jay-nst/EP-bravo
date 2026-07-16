import { describe, it, expect } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('checkRateLimit', () => {
  it('allows requests within the limit', () => {
    const key = `test-allow-${Date.now()}`;
    const config = { windowMs: 10_000, maxRequests: 3 };

    const r1 = checkRateLimit(key, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(key, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests exceeding the limit', () => {
    const key = `test-block-${Date.now()}`;
    const config = { windowMs: 10_000, maxRequests: 2 };

    checkRateLimit(key, config);
    checkRateLimit(key, config);

    const r3 = checkRateLimit(key, config);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.resetMs).toBeGreaterThan(0);
  });

  it('uses different keys independently', () => {
    const ts = Date.now();
    const keyA = `test-a-${ts}`;
    const keyB = `test-b-${ts}`;
    const config = { windowMs: 10_000, maxRequests: 1 };

    const rA = checkRateLimit(keyA, config);
    expect(rA.allowed).toBe(true);

    const rB = checkRateLimit(keyB, config);
    expect(rB.allowed).toBe(true);

    const rA2 = checkRateLimit(keyA, config);
    expect(rA2.allowed).toBe(false);
  });

  it('returns reset time when blocked', () => {
    const key = `test-reset-${Date.now()}`;
    const config = { windowMs: 5_000, maxRequests: 1 };

    checkRateLimit(key, config);
    const blocked = checkRateLimit(key, config);

    expect(blocked.allowed).toBe(false);
    expect(blocked.resetMs).toBeLessThanOrEqual(5_000);
    expect(blocked.resetMs).toBeGreaterThan(0);
  });
});
