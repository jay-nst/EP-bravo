import { describe, it, expect } from 'vitest';
import { apiError, badRequest, unauthorized, notFound, unsupportedMediaType, serverError } from './api-error';

describe('apiError helpers', () => {
  it('apiError creates response with correct status and body', async () => {
    const res = apiError('test error', 422, { code: 'TEST', details: { field: 'x' } });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toEqual({ error: 'test error', code: 'TEST', details: { field: 'x' } });
  });

  it('apiError omits code and details when not provided', async () => {
    const res = apiError('simple error', 400);
    const body = await res.json();
    expect(body).toEqual({ error: 'simple error' });
    expect(body).not.toHaveProperty('code');
    expect(body).not.toHaveProperty('details');
  });

  it('badRequest returns 400', async () => {
    const res = badRequest('bad input', ['field1']);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('bad input');
    expect(body.details).toEqual(['field1']);
  });

  it('unauthorized returns 401', async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('인증이 필요합니다');
  });

  it('notFound returns 404', async () => {
    const res = notFound('not here');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('not here');
  });

  it('unsupportedMediaType returns 415', async () => {
    const res = unsupportedMediaType();
    expect(res.status).toBe(415);
    const body = await res.json();
    expect(body.error).toContain('Content-Type');
  });

  it('serverError returns 500', async () => {
    const res = serverError('db down', 'connection refused');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('db down');
    expect(body.details).toBe('connection refused');
  });
});
