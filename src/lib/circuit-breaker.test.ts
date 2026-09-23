import { describe, it, expect } from 'vitest';
import { createCircuitBreaker } from './circuit-breaker';

const THRESHOLD = 3;
const COOLDOWN = 60_000;

function makeBreaker() {
  return createCircuitBreaker({ threshold: THRESHOLD, cooldownMs: COOLDOWN });
}

describe('createCircuitBreaker', () => {
  it('allows requests while closed', () => {
    const cb = makeBreaker();
    expect(cb.canRequest(0)).toBe(true);
    expect(cb.canRequest(1)).toBe(true);
  });

  it('stays closed below the failure threshold', () => {
    const cb = makeBreaker();
    cb.recordFailure(0);
    cb.recordFailure(1);
    expect(cb.canRequest(2)).toBe(true);
  });

  it('opens after threshold consecutive failures', () => {
    const cb = makeBreaker();
    cb.recordFailure(0);
    cb.recordFailure(1);
    cb.recordFailure(2);
    expect(cb.canRequest(3)).toBe(false);
  });

  it('a success resets the consecutive-failure count', () => {
    const cb = makeBreaker();
    cb.recordFailure(0);
    cb.recordFailure(1);
    cb.recordSuccess();
    cb.recordFailure(2);
    cb.recordFailure(3);
    expect(cb.canRequest(4)).toBe(true);
  });

  it('blocks for the full cooldown, then allows a single probe', () => {
    const cb = makeBreaker();
    cb.recordFailure(0);
    cb.recordFailure(0);
    cb.recordFailure(0);
    expect(cb.canRequest(COOLDOWN - 1)).toBe(false);
    expect(cb.canRequest(COOLDOWN)).toBe(true); // half-open probe
    expect(cb.canRequest(COOLDOWN + 1)).toBe(false); // only one probe at a time
  });

  it('closes again when the probe succeeds', () => {
    const cb = makeBreaker();
    cb.recordFailure(0);
    cb.recordFailure(0);
    cb.recordFailure(0);
    expect(cb.canRequest(COOLDOWN)).toBe(true);
    cb.recordSuccess();
    expect(cb.canRequest(COOLDOWN + 1)).toBe(true);
    expect(cb.canRequest(COOLDOWN + 2)).toBe(true);
  });

  it('re-opens for another full cooldown when the probe fails', () => {
    const cb = makeBreaker();
    cb.recordFailure(0);
    cb.recordFailure(0);
    cb.recordFailure(0);
    expect(cb.canRequest(COOLDOWN)).toBe(true);
    cb.recordFailure(COOLDOWN + 12_000); // slow failure 12s later
    expect(cb.canRequest(COOLDOWN + 12_000 + COOLDOWN - 1)).toBe(false);
    expect(cb.canRequest(COOLDOWN + 12_000 + COOLDOWN)).toBe(true);
  });
});
