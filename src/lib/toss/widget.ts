// Toss Payments client-side SDK wrapper
// Uses @tosspayments/tosspayments-sdk for payment widget

export async function requestTossPayment(params: {
  orderId: string;
  amount: number;
  orderName: string;
  customerEmail: string;
}) {
  const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) throw new Error('NEXT_PUBLIC_TOSS_CLIENT_KEY is not set');

  const tossPayments = await loadTossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey: params.customerEmail });

  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: params.amount },
    orderId: params.orderId,
    orderName: params.orderName,
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
}
