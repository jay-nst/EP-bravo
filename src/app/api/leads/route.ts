import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_VERTICALS = ['citadel', 'predict', 'warden', 'northpaper', 'newsletter'] as const;
const VALID_ROLES = ['compliance', 'finance', 'government', 'research', 'other'] as const;
const VALID_BUDGETS = ['', 'under_10k', '10k_50k', '50k_100k', 'over_100k'] as const;

interface LeadPayload {
  name: string;
  email: string;
  company: string;
  role: string;
  use_case?: string;
  budget?: string;
  vertical: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, company, role, use_case, budget, vertical } = body;

  if (!email?.trim()) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  if (!isValidEmail(email.trim())) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  if (!VALID_VERTICALS.includes(vertical as typeof VALID_VERTICALS[number])) {
    return NextResponse.json({ error: 'Invalid vertical' }, { status: 400 });
  }

  const isNewsletter = vertical === 'newsletter';

  if (!isNewsletter && (!name?.trim() || !company?.trim() || !role)) {
    return NextResponse.json({ error: 'name, email, company, role are required' }, { status: 400 });
  }

  if (!isNewsletter && !VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  if (budget && !VALID_BUDGETS.includes(budget as typeof VALID_BUDGETS[number])) {
    return NextResponse.json({ error: 'Invalid budget range' }, { status: 400 });
  }

  const lead = {
    name: name?.trim() || '',
    email: email.trim(),
    company: company?.trim() || '',
    role: role || 'other',
    use_case: use_case?.trim() || '',
    budget: budget || '',
    vertical,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select('id')
    .single();

  if (error) {
    console.error('[LEAD] Supabase insert failed:', error.message);
    return NextResponse.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
