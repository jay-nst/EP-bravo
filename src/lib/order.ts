import type { OrderStatus, PaymentStatus } from '@/types/database';

// Valid order state transitions (F1: 2-step payment pattern)
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['payment_held'],
  payment_held: ['processing'],
  processing: ['completed', 'failed'],
  completed: [],
  failed: ['refunded'],
  refunded: [],
};

const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  held: ['confirmed', 'refund_queued'],
  confirmed: [],
  refund_queued: ['refunded', 'failed'],
  refunded: [],
  failed: [],
};

export function isValidOrderTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidPaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): boolean {
  return PAYMENT_TRANSITIONS[from]?.includes(to) ?? false;
}
