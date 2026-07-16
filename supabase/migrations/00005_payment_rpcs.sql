-- Payment transaction RPCs
-- Wraps multi-step payment DB operations in atomic transactions
-- with SELECT FOR UPDATE to prevent double-processing (idempotency)

-- RPC 1: Claim an order for payment processing
-- Atomically checks ownership + pending status and transitions to payment_held
-- Uses FOR UPDATE to prevent concurrent claims on the same order
create or replace function public.claim_order_for_payment(
  p_order_id uuid,
  p_user_id uuid,
  p_payment_key text,
  p_amount numeric
)
returns jsonb as $$
declare
  v_order record;
begin
  -- Lock the order row to prevent concurrent processing
  select * into v_order
  from public.orders
  where id = p_order_id
    and user_id = p_user_id
    and status = 'pending'
  for update skip locked;

  if v_order is null then
    return jsonb_build_object('success', false, 'error', 'order_not_found_or_locked');
  end if;

  -- Verify amount matches
  if v_order.total_price != p_amount then
    return jsonb_build_object('success', false, 'error', 'amount_mismatch');
  end if;

  -- Transition to payment_held
  update public.orders
  set status = 'payment_held', updated_at = now()
  where id = p_order_id;

  -- Create payment record
  insert into public.payments (order_id, user_id, pg_payment_key, amount, status, held_at)
  values (p_order_id, p_user_id, p_payment_key, p_amount, 'held', now());

  return jsonb_build_object(
    'success', true,
    'catalog_item_id', v_order.catalog_item_id,
    'aoi', v_order.aoi,
    'total_price', v_order.total_price
  );
end;
$$ language plpgsql security definer;


-- RPC 2: Complete order after successful clipping
-- Atomically updates order, payment, and creates download record
create or replace function public.complete_order_after_clip(
  p_order_id uuid,
  p_user_id uuid,
  p_clip_result_url text,
  p_file_size bigint
)
returns jsonb as $$
declare
  v_expires_at timestamptz;
begin
  v_expires_at := now() + interval '7 days';

  -- Update order to completed
  update public.orders
  set status = 'completed',
      clip_result_url = p_clip_result_url,
      updated_at = now()
  where id = p_order_id and status = 'processing';

  if not found then
    return jsonb_build_object('success', false, 'error', 'order_not_processing');
  end if;

  -- Confirm payment
  update public.payments
  set status = 'confirmed', confirmed_at = now()
  where order_id = p_order_id and status = 'held';

  -- Create download record
  insert into public.downloads (order_id, user_id, file_url, file_size, expires_at)
  values (p_order_id, p_user_id, p_clip_result_url, p_file_size, v_expires_at);

  return jsonb_build_object('success', true, 'expires_at', v_expires_at);
end;
$$ language plpgsql security definer;


-- RPC 3: Mark order as failed and handle refund status
-- Atomically updates order and payment status for failure/refund
create or replace function public.fail_order_and_refund(
  p_order_id uuid,
  p_error_message text,
  p_refund_status text default 'refund_queued'
)
returns jsonb as $$
begin
  -- Update order to failed
  update public.orders
  set status = case
    when p_refund_status = 'refunded' then 'refunded'
    else 'failed'
  end,
  error_message = p_error_message,
  updated_at = now()
  where id = p_order_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'order_not_found');
  end if;

  -- Update payment status
  update public.payments
  set status = p_refund_status,
      refunded_at = case when p_refund_status = 'refunded' then now() else null end
  where order_id = p_order_id;

  return jsonb_build_object('success', true);
end;
$$ language plpgsql security definer;
