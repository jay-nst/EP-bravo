-- increment_chat_tokens: RPC function called by chat/save API
-- Atomically increments the user's chat_tokens_used in profiles

create or replace function public.increment_chat_tokens(
  user_id uuid,
  token_count int
)
returns void as $$
begin
  update public.profiles
  set chat_tokens_used = chat_tokens_used + token_count,
      updated_at = now()
  where id = increment_chat_tokens.user_id;
end;
$$ language plpgsql security definer;
