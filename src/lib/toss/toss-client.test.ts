import { describe, it, expect } from 'vitest';
import { TossError } from './client';

describe('TossError', () => {
  it('creates error with code and message', () => {
    const err = new TossError('ALREADY_PROCESSED', '이미 처리된 결제입니다');
    expect(err.code).toBe('ALREADY_PROCESSED');
    expect(err.message).toBe('이미 처리된 결제입니다');
    expect(err.name).toBe('TossError');
    expect(err).toBeInstanceOf(Error);
  });

  it('is catchable as Error', () => {
    try {
      throw new TossError('INVALID_REQUEST', 'bad');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(TossError);
      if (e instanceof TossError) {
        expect(e.code).toBe('INVALID_REQUEST');
      }
    }
  });
});
