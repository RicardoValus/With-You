import { describe, expect, it } from 'vitest';
import { calculateTogetherDuration } from './together-duration';

describe('calculateTogetherDuration', () => {
  it('should compute calendar units instead of raw ms division', () => {
    const start = new Date('2024-01-31T12:00:00-03:00');
    const now = new Date('2024-03-01T14:30:45-03:00');
    const result = calculateTogetherDuration(start, now);

    expect(result.years).toBe(0);
    expect(result.months).toBe(1);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(2);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(45);
  });

  it('should return zeros when start is in the future', () => {
    const start = new Date('2030-01-01T00:00:00-03:00');
    const now = new Date('2026-11-06T12:00:00-03:00');
    expect(calculateTogetherDuration(start, now)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
