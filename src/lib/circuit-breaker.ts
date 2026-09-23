/**
 * Minimal circuit breaker for polling a backend that may be down.
 *
 * Opens after `threshold` consecutive failures, then blocks requests for
 * `cooldownMs`. After the cooldown a single probe is allowed (half-open):
 * success closes the breaker, failure re-opens it for another cooldown.
 *
 * Time is passed in by the caller so the logic stays deterministic in tests.
 */
export interface CircuitBreaker {
  /** Whether a request may be sent now. Consumes the half-open probe slot. */
  canRequest(now: number): boolean;
  recordSuccess(): void;
  recordFailure(now: number): void;
}

export interface CircuitBreakerOptions {
  /** Consecutive failures before the breaker opens. */
  threshold: number;
  /** How long requests stay blocked after opening. */
  cooldownMs: number;
}

export function createCircuitBreaker({
  threshold,
  cooldownMs,
}: CircuitBreakerOptions): CircuitBreaker {
  let consecutiveFailures = 0;
  let openedAt: number | null = null;
  let probing = false;

  return {
    canRequest(now: number): boolean {
      if (openedAt === null) return true;
      if (probing) return false;
      if (now - openedAt < cooldownMs) return false;
      probing = true;
      return true;
    },
    recordSuccess(): void {
      consecutiveFailures = 0;
      openedAt = null;
      probing = false;
    },
    recordFailure(now: number): void {
      if (probing) {
        // Failed half-open probe: re-open for another full cooldown.
        openedAt = now;
        probing = false;
        return;
      }
      consecutiveFailures += 1;
      if (consecutiveFailures >= threshold) {
        openedAt = now;
      }
    },
  };
}
