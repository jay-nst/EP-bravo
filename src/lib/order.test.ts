import { describe, it, expect } from 'vitest';
import { isValidOrderTransition, isValidPaymentTransition } from './order';

describe('isValidOrderTransition', () => {
  it('allows pending → payment_held', () => {
    expect(isValidOrderTransition('pending', 'payment_held')).toBe(true);
  });

  it('allows payment_held → processing', () => {
    expect(isValidOrderTransition('payment_held', 'processing')).toBe(true);
  });

  it('allows processing → completed (happy path)', () => {
    expect(isValidOrderTransition('processing', 'completed')).toBe(true);
  });

  it('allows processing → failed (clip error)', () => {
    expect(isValidOrderTransition('processing', 'failed')).toBe(true);
  });

  it('allows failed → refunded', () => {
    expect(isValidOrderTransition('failed', 'refunded')).toBe(true);
  });

  it('rejects pending → completed (skip payment)', () => {
    expect(isValidOrderTransition('pending', 'completed')).toBe(false);
  });

  it('rejects completed → refunded (no refund after success)', () => {
    expect(isValidOrderTransition('completed', 'refunded')).toBe(false);
  });

  it('rejects completed → any (terminal state)', () => {
    expect(isValidOrderTransition('completed', 'pending')).toBe(false);
    expect(isValidOrderTransition('completed', 'failed')).toBe(false);
  });

  it('rejects refunded → any (terminal state)', () => {
    expect(isValidOrderTransition('refunded', 'pending')).toBe(false);
  });
});

describe('isValidPaymentTransition', () => {
  it('allows held → confirmed (clip success)', () => {
    expect(isValidPaymentTransition('held', 'confirmed')).toBe(true);
  });

  it('allows held → refund_queued (clip failure)', () => {
    expect(isValidPaymentTransition('held', 'refund_queued')).toBe(true);
  });

  it('allows refund_queued → refunded', () => {
    expect(isValidPaymentTransition('refund_queued', 'refunded')).toBe(true);
  });

  it('allows refund_queued → failed (refund API error)', () => {
    expect(isValidPaymentTransition('refund_queued', 'failed')).toBe(true);
  });

  it('rejects confirmed → refunded (no refund after confirm)', () => {
    expect(isValidPaymentTransition('confirmed', 'refunded')).toBe(false);
  });

  it('rejects held → failed directly', () => {
    expect(isValidPaymentTransition('held', 'failed')).toBe(false);
  });
});
