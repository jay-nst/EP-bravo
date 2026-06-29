// Toss Payments server-side client
// F1: 2-step payment pattern (auth → clip → capture/refund)

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

function getAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error('TOSS_SECRET_KEY is not set');
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
  method: string;
  [key: string]: unknown;
}

/**
 * Step 1: Confirm (authorize) a payment.
 * Called after the client-side widget returns paymentKey + orderId + amount.
 * This puts the payment in "DONE" status but does NOT capture yet for auth-only flow.
 */
export async function confirmPayment(params: {
  paymentKey: string;
  orderId: string;
  amount: number;
}): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new TossError(error.code, error.message);
  }

  return res.json();
}

/**
 * Cancel (refund) a payment.
 * Used when clipping fails after payment authorization.
 */
export async function cancelPayment(params: {
  paymentKey: string;
  cancelReason: string;
}): Promise<TossPaymentResponse> {
  const res = await fetch(
    `${TOSS_API_BASE}/payments/${params.paymentKey}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelReason: params.cancelReason }),
    },
  );

  if (!res.ok) {
    const error = await res.json();
    throw new TossError(error.code, error.message);
  }

  return res.json();
}

/**
 * Look up a payment by paymentKey.
 */
export async function getPayment(
  paymentKey: string,
): Promise<TossPaymentResponse> {
  const res = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}`, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new TossError(error.code, error.message);
  }

  return res.json();
}

export class TossError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TossError';
  }
}
