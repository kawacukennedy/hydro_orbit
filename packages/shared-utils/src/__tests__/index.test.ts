import { describe, it, expect } from 'vitest';
import { debounce, throttle, generateId, formatDate, formatPercentage } from '../index';

describe('generateId', () => {
  it('should return a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('should return unique values', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('formatDate', () => {
  it('should format dates correctly', () => {
    const date = new Date('2026-06-24T10:00:00Z');
    const result = formatDate(date);
    expect(result).toBe('Jun 24, 2026');
  });
});

describe('formatPercentage', () => {
  it('should format numbers as percentages', () => {
    expect(formatPercentage(42.567)).toBe('42.6%');
    expect(formatPercentage(100)).toBe('100.0%');
    expect(formatPercentage(0)).toBe('0.0%');
  });
});

describe('debounce', () => {
  it('should delay function execution', async () => {
    let callCount = 0;
    const fn = debounce(() => { callCount++; }, 50);
    fn();
    fn();
    fn();
    expect(callCount).toBe(0);
    await new Promise(r => setTimeout(r, 100));
    expect(callCount).toBe(1);
  });
});

describe('throttle', () => {
  it('should limit function calls', async () => {
    let callCount = 0;
    const fn = throttle(() => { callCount++; }, 50);
    fn();
    fn();
    fn();
    expect(callCount).toBe(1);
    await new Promise(r => setTimeout(r, 60));
    fn();
    expect(callCount).toBe(2);
  });
});
