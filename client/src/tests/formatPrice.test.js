// client/src/tests/formatPrice.test.js
import { describe, it, expect } from 'vitest';
import { formatPrice } from '../utils/formatPrice'; // Adjust path if necessary

describe('formatPrice utility', () => {
  it('should format a number into Indian Rupee currency format', () => {
    expect(formatPrice(1000)).toBe('₹1,000.00');
  });

  it('should format a number with decimals', () => {
    expect(formatPrice(1234.56)).toBe('₹1,234.56');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('₹0.00');
  });

  it('should handle undefined or null by returning ₹0.00 or a specific string', () => {
    // Depending on the actual implementation of formatPrice for null/undefined
    expect(formatPrice(undefined)).toBe('₹0.00'); // Or whatever it defaults to
    expect(formatPrice(null)).toBe('₹0.00');      // Or whatever it defaults to
  });

  it('should handle string numbers if the function supports it', () => {
    expect(formatPrice('500')).toBe('₹500.00');
  });
});
