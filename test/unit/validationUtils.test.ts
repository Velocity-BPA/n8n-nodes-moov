/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  validateAccountId,
  validateEmail,
  validatePhone,
  validateRoutingNumber,
  validateAccountNumber,
  validateCardNumber,
  validateAmount,
  validateDateRange,
  validateUrl,
  validateCountryCode,
  validateStateCode,
  validatePostalCode,
  validateTaxId,
} from '../../nodes/Moov/utils/validationUtils';

describe('ValidationUtils', () => {
  describe('validateAccountId', () => {
    it('should accept valid UUID account IDs', () => {
      expect(validateAccountId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validateAccountId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should reject invalid account IDs', () => {
      expect(validateAccountId('')).toBe(false);
      expect(validateAccountId('invalid')).toBe(false);
      expect(validateAccountId('123')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.org')).toBe(true);
      expect(validateEmail('user+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('no@domain')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhone('+14155551234')).toBe(true);
      expect(validatePhone('+12025551234')).toBe(true);
      expect(validatePhone('+447911123456')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('invalid')).toBe(false);
      expect(validatePhone('123')).toBe(false);
    });
  });

  describe('validateRoutingNumber', () => {
    it('should accept valid routing numbers', () => {
      expect(validateRoutingNumber('021000021')).toBe(true);
      expect(validateRoutingNumber('121000358')).toBe(true);
      expect(validateRoutingNumber('071000013')).toBe(true);
    });

    it('should reject invalid routing numbers', () => {
      expect(validateRoutingNumber('')).toBe(false);
      expect(validateRoutingNumber('12345678')).toBe(false);
      expect(validateRoutingNumber('1234567890')).toBe(false);
      expect(validateRoutingNumber('abcdefghi')).toBe(false);
    });
  });

  describe('validateAccountNumber', () => {
    it('should accept valid account numbers', () => {
      expect(validateAccountNumber('1234567890')).toBe(true);
      expect(validateAccountNumber('12345678901234567')).toBe(true);
      expect(validateAccountNumber('1234')).toBe(true);
    });

    it('should reject invalid account numbers', () => {
      expect(validateAccountNumber('')).toBe(false);
      expect(validateAccountNumber('123')).toBe(false);
      expect(validateAccountNumber('abcdefghij')).toBe(false);
    });
  });

  describe('validateCardNumber', () => {
    it('should accept valid card numbers (Luhn algorithm)', () => {
      expect(validateCardNumber('4111111111111111')).toBe(true);
      expect(validateCardNumber('5500000000000004')).toBe(true);
      expect(validateCardNumber('340000000000009')).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      expect(validateCardNumber('')).toBe(false);
      expect(validateCardNumber('1234567890123456')).toBe(false);
      expect(validateCardNumber('invalid')).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should accept valid amounts', () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(1)).toBe(true);
      expect(validateAmount(999999999)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date ranges', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      expect(validateDateRange(startDate, endDate)).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const startDate = new Date('2024-12-31');
      const endDate = new Date('2024-01-01');
      expect(validateDateRange(startDate, endDate)).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('https://example.com/path')).toBe(true);
      expect(validateUrl('https://sub.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('')).toBe(false);
      expect(validateUrl('invalid')).toBe(false);
      expect(validateUrl('http://example.com')).toBe(false); // Only HTTPS
    });
  });

  describe('validateCountryCode', () => {
    it('should accept valid country codes', () => {
      expect(validateCountryCode('US')).toBe(true);
      expect(validateCountryCode('GB')).toBe(true);
      expect(validateCountryCode('CA')).toBe(true);
    });

    it('should reject invalid country codes', () => {
      expect(validateCountryCode('')).toBe(false);
      expect(validateCountryCode('USA')).toBe(false);
      expect(validateCountryCode('X')).toBe(false);
    });
  });

  describe('validateStateCode', () => {
    it('should accept valid state codes', () => {
      expect(validateStateCode('CA')).toBe(true);
      expect(validateStateCode('NY')).toBe(true);
      expect(validateStateCode('TX')).toBe(true);
    });

    it('should reject invalid state codes', () => {
      expect(validateStateCode('')).toBe(false);
      expect(validateStateCode('California')).toBe(false);
      expect(validateStateCode('X')).toBe(false);
    });
  });

  describe('validatePostalCode', () => {
    it('should accept valid US postal codes', () => {
      expect(validatePostalCode('12345', 'US')).toBe(true);
      expect(validatePostalCode('12345-6789', 'US')).toBe(true);
    });

    it('should accept valid UK postal codes', () => {
      expect(validatePostalCode('SW1A 1AA', 'GB')).toBe(true);
      expect(validatePostalCode('EC1A 1BB', 'GB')).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(validatePostalCode('', 'US')).toBe(false);
      expect(validatePostalCode('1234', 'US')).toBe(false);
    });
  });

  describe('validateTaxId', () => {
    it('should accept valid EIN format', () => {
      expect(validateTaxId('12-3456789', 'EIN')).toBe(true);
    });

    it('should accept valid SSN format', () => {
      expect(validateTaxId('123-45-6789', 'SSN')).toBe(true);
    });

    it('should accept valid ITIN format', () => {
      expect(validateTaxId('9XX-XX-XXXX', 'ITIN')).toBe(true);
    });

    it('should reject invalid tax IDs', () => {
      expect(validateTaxId('', 'EIN')).toBe(false);
      expect(validateTaxId('123456789', 'EIN')).toBe(false);
    });
  });
});
