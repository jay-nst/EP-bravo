import { NextResponse } from 'next/server';

interface ApiErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

export function apiError(
  message: string,
  status: number,
  opts?: { code?: string; details?: unknown },
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: message };
  if (opts?.code) body.code = opts.code;
  if (opts?.details !== undefined) body.details = opts.details;
  return NextResponse.json(body, { status });
}

export function badRequest(message: string, details?: unknown) {
  return apiError(message, 400, { details });
}

export function unauthorized(message = '인증이 필요합니다') {
  return apiError(message, 401);
}

export function notFound(message: string) {
  return apiError(message, 404);
}

export function unsupportedMediaType() {
  return apiError('Content-Type must be application/json', 415);
}

export function serverError(message: string, details?: unknown) {
  return apiError(message, 500, { details });
}
