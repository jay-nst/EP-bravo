import { describe, it, expect } from 'vitest';
import { isValidOrderTransition, isValidPaymentTransition } from './order';
import { calculatePrice, validateAoi, calculateAreaKm2 } from './geo';
import { z } from 'zod';

const confirmSchema = z.object({
  paymentKey: z.string(),
  orderId: z.string().uuid(),
  amount: z.number().positive(),
});

const createOrderSchema = z.object({
  catalogItemId: z.string().uuid(),
  aoi: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
});

describe('Payment confirm schema validation', () => {
  it('accepts valid confirm request', () => {
    const result = confirmSchema.safeParse({
      paymentKey: 'toss_pk_test_abc123',
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 50000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing paymentKey', () => {
    const result = confirmSchema.safeParse({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 50000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID for orderId', () => {
    const result = confirmSchema.safeParse({
      paymentKey: 'toss_pk_test_abc123',
      orderId: 'not-a-uuid',
      amount: 50000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = confirmSchema.safeParse({
      paymentKey: 'toss_pk_test_abc123',
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      amount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = confirmSchema.safeParse({
      paymentKey: 'toss_pk_test_abc123',
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      amount: -1000,
    });
    expect(result.success).toBe(false);
  });
});

describe('Create order schema validation', () => {
  const validPolygon = {
    type: 'Polygon' as const,
    coordinates: [[[127.0, 37.0], [127.1, 37.0], [127.1, 37.1], [127.0, 37.1], [127.0, 37.0]]],
  };

  it('accepts valid create order request', () => {
    const result = createOrderSchema.safeParse({
      catalogItemId: '550e8400-e29b-41d4-a716-446655440000',
      aoi: validPolygon,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-Polygon type', () => {
    const result = createOrderSchema.safeParse({
      catalogItemId: '550e8400-e29b-41d4-a716-446655440000',
      aoi: { type: 'Point', coordinates: [127.0, 37.0] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing catalogItemId', () => {
    const result = createOrderSchema.safeParse({
      aoi: validPolygon,
    });
    expect(result.success).toBe(false);
  });
});

describe('Payment flow: full happy path state transitions', () => {
  it('validates the complete happy path: pending → payment_held → processing → completed', () => {
    expect(isValidOrderTransition('pending', 'payment_held')).toBe(true);
    expect(isValidOrderTransition('payment_held', 'processing')).toBe(true);
    expect(isValidOrderTransition('processing', 'completed')).toBe(true);
  });

  it('validates happy path payment: held → confirmed', () => {
    expect(isValidPaymentTransition('held', 'confirmed')).toBe(true);
  });

  it('validates the failure + refund path', () => {
    expect(isValidOrderTransition('pending', 'payment_held')).toBe(true);
    expect(isValidOrderTransition('payment_held', 'processing')).toBe(true);
    expect(isValidOrderTransition('processing', 'failed')).toBe(true);
    expect(isValidOrderTransition('failed', 'refunded')).toBe(true);
  });

  it('validates failure path payment: held → refund_queued → refunded', () => {
    expect(isValidPaymentTransition('held', 'refund_queued')).toBe(true);
    expect(isValidPaymentTransition('refund_queued', 'refunded')).toBe(true);
  });
});

describe('Payment flow: pre-payment AOI validation', () => {
  const smallPolygon: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [[[127.0, 37.0], [127.001, 37.0], [127.001, 37.001], [127.0, 37.001], [127.0, 37.0]]],
  };

  const normalPolygon: GeoJSON.Polygon = {
    type: 'Polygon',
    coordinates: [[[127.0, 37.0], [127.1, 37.0], [127.1, 37.1], [127.0, 37.1], [127.0, 37.0]]],
  };

  it('rejects AOI below minimum area for observer satellite', () => {
    const area = calculateAreaKm2(smallPolygon);
    const error = validateAoi(area, 'observer');
    expect(error).not.toBeNull();
    expect(error).toContain('최소 주문 면적');
  });

  it('accepts valid AOI for observer satellite', () => {
    const area = calculateAreaKm2(normalPolygon);
    const error = validateAoi(area, 'observer');
    expect(error).toBeNull();
  });

  it('calculates price correctly', () => {
    const price = calculatePrice(100, 'observer');
    expect(price).toBeGreaterThan(0);
    expect(typeof price).toBe('number');
  });

  it('rejects AOI exceeding maximum area', () => {
    const error = validateAoi(15000, 'observer');
    expect(error).not.toBeNull();
    expect(error).toContain('최대 주문 면적');
  });
});

describe('Payment flow: idempotency invariants', () => {
  it('completed order cannot be re-processed', () => {
    expect(isValidOrderTransition('completed', 'pending')).toBe(false);
    expect(isValidOrderTransition('completed', 'payment_held')).toBe(false);
    expect(isValidOrderTransition('completed', 'processing')).toBe(false);
  });

  it('refunded order cannot be re-processed', () => {
    expect(isValidOrderTransition('refunded', 'pending')).toBe(false);
    expect(isValidOrderTransition('refunded', 'payment_held')).toBe(false);
  });

  it('confirmed payment cannot transition further', () => {
    expect(isValidPaymentTransition('confirmed', 'held')).toBe(false);
    expect(isValidPaymentTransition('confirmed', 'refunded')).toBe(false);
    expect(isValidPaymentTransition('confirmed', 'refund_queued')).toBe(false);
  });

  it('refunded payment is terminal', () => {
    expect(isValidPaymentTransition('refunded', 'held')).toBe(false);
    expect(isValidPaymentTransition('refunded', 'confirmed')).toBe(false);
  });
});

describe('TossError class', () => {
  it('can be imported and instantiated', async () => {
    const { TossError } = await import('./toss/client');
    const error = new TossError('INVALID_PAYMENT', '유효하지 않은 결제');
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('INVALID_PAYMENT');
    expect(error.message).toBe('유효하지 않은 결제');
    expect(error.name).toBe('TossError');
  });
});
