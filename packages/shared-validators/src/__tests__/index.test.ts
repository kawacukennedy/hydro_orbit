import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, farmSchema, sensorReadingSchema } from '../index';

describe('loginSchema', () => {
  it('should validate a correct login payload', () => {
    const result = loginSchema.safeParse({ phone: '+250788123456', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('should reject missing phone', () => {
    const result = loginSchema.safeParse({ password: 'password123' });
    expect(result.success).toBe(false);
  });

  it('should reject short passwords', () => {
    const result = loginSchema.safeParse({ phone: '+250788123456', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('should validate a correct registration payload', () => {
    const result = registerSchema.safeParse({
      name: 'John Doe',
      phone: '+250788123456',
      password: 'securePass123'
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing name', () => {
    const result = registerSchema.safeParse({ phone: '+250788123456', password: 'securePass123' });
    expect(result.success).toBe(false);
  });
});

describe('farmSchema', () => {
  it('should validate a correct farm payload', () => {
    const result = farmSchema.safeParse({ name: 'My Farm', location: 'Rwamagana', area: 2.5 });
    expect(result.success).toBe(true);
  });

  it('should reject negative farm area', () => {
    const result = farmSchema.safeParse({ name: 'My Farm', location: 'Rwamagana', area: -1 });
    expect(result.success).toBe(false);
  });
});

describe('sensorReadingSchema', () => {
  it('should validate a correct sensor reading', () => {
    const result = sensorReadingSchema.safeParse({
      sensorId: 'esp32-001',
      value: 42.5
    });
    expect(result.success).toBe(true);
  });

  it('should accept readings with optional timestamp', () => {
    const result = sensorReadingSchema.safeParse({
      sensorId: 'esp32-001',
      value: 42.5,
      timestamp: new Date()
    });
    expect(result.success).toBe(true);
  });
});
