import { describe, it, expect } from 'vitest';
import { toRupees, toPaise, formatINR, formatSignedTransaction } from '@/domain/calculations/money';

describe('EXPENZO Money & Currency Utilities', () => {
  it('converts between integer paise and rupees accurately', () => {
    expect(toRupees(5000000)).toBe(50000);
    expect(toRupees(150)).toBe(1.5);
    expect(toPaise(50000)).toBe(5000000);
    expect(toPaise(1.5)).toBe(150);
  });

  it('formats positive INR amounts with Indian grouping', () => {
    expect(formatINR(5000000)).toBe('₹50,000');
    expect(formatINR(12540000)).toBe('₹1,25,400');
    expect(formatINR(10000000)).toBe('₹1,00,000');
  });

  it('formats negative INR amounts with proper Unicode minus sign', () => {
    expect(formatINR(-50000)).toBe('−₹500');
    expect(formatINR(-1200000)).toBe('−₹12,000');
  });

  it('formats compact representations in Lakhs and Crores when requested', () => {
    // 15 Lakhs = 15,00,000 rupees = 150000000 paise
    expect(formatINR(150000000, { compact: true })).toBe('₹15.00 L');
    // 2 Crores = 2,00,00,000 rupees = 2000000000 paise
    expect(formatINR(2000000000, { compact: true })).toBe('₹2.00 Cr');
  });

  it('formats signed transactions according to type', () => {
    expect(formatSignedTransaction(5200000, 'income')).toBe('+₹52,000');
    expect(formatSignedTransaction(1200000, 'expense')).toBe('−₹12,000');
    expect(formatSignedTransaction(500000, 'transfer')).toBe('₹5,000');
  });
});

