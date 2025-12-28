/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Validation Utilities for Moov API
 */

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate routing number (ABA)
 */
export function isValidRoutingNumber(routingNumber: string): boolean {
  if (!/^\d{9}$/.test(routingNumber)) {
    return false;
  }

  // ABA routing number checksum validation
  const digits = routingNumber.split('').map(Number);
  const checksum =
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    1 * (digits[2] + digits[5] + digits[8]);

  return checksum % 10 === 0;
}

/**
 * Validate account number format (basic validation)
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  // Account numbers are typically 4-17 digits
  return /^\d{4,17}$/.test(accountNumber);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (E.164 format or US format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +1234567890
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  // US format: (123) 456-7890 or 123-456-7890 or 1234567890
  const usRegex = /^(\+1)?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

  return e164Regex.test(phone) || usRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Normalize phone to E.164 format
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  if (phone.startsWith('+')) {
    return phone;
  }
  return `+${digits}`;
}

/**
 * Validate EIN (Employer Identification Number)
 */
export function isValidEIN(ein: string): boolean {
  // EIN format: XX-XXXXXXX
  const normalized = ein.replace(/\D/g, '');
  return normalized.length === 9;
}

/**
 * Format EIN with hyphen
 */
export function formatEIN(ein: string): string {
  const normalized = ein.replace(/\D/g, '');
  if (normalized.length === 9) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2)}`;
  }
  return ein;
}

/**
 * Validate SSN (Social Security Number)
 */
export function isValidSSN(ssn: string): boolean {
  const normalized = ssn.replace(/\D/g, '');
  if (normalized.length !== 9) {
    return false;
  }

  // SSN cannot start with 000, 666, or 9xx
  const area = parseInt(normalized.slice(0, 3), 10);
  if (area === 0 || area === 666 || area >= 900) {
    return false;
  }

  // Group number cannot be 00
  const group = parseInt(normalized.slice(3, 5), 10);
  if (group === 0) {
    return false;
  }

  // Serial number cannot be 0000
  const serial = parseInt(normalized.slice(5), 10);
  if (serial === 0) {
    return false;
  }

  return true;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate birth date is reasonable (18+ years old, not in future)
 */
export function isValidBirthDate(dateString: string): boolean {
  if (!isValidDate(dateString)) {
    return false;
  }

  const birthDate = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  // Must be at least 18 years old
  if (age < 18) {
    return false;
  }

  // Must not be unreasonably old (150 years)
  if (age > 150) {
    return false;
  }

  return true;
}

/**
 * Validate US ZIP code
 */
export function isValidZipCode(zipCode: string): boolean {
  // 5 digit or 5+4 format
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

/**
 * Validate US state code
 */
export function isValidStateCode(stateCode: string): boolean {
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
  ];
  return validStates.includes(stateCode.toUpperCase());
}

/**
 * Validate amount (positive number with up to 2 decimal places)
 */
export function isValidAmount(amount: number | string): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num < 0) {
    return false;
  }
  // Check for at most 2 decimal places
  const str = num.toString();
  const parts = str.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    return false;
  }
  return true;
}

/**
 * Convert amount to cents (integer)
 */
export function amountToCents(amount: number | string): number {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(num * 100);
}

/**
 * Convert cents to amount (decimal)
 */
export function centsToAmount(cents: number): number {
  return cents / 100;
}

/**
 * Validate card number using Luhn algorithm
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate CVV
 */
export function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Validate expiration date (MM/YY or MM/YYYY format)
 */
export function isValidExpirationDate(expDate: string): boolean {
  const match = expDate.match(/^(\d{2})\/(\d{2}|\d{4})$/);
  if (!match) {
    return false;
  }

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return false;
  }

  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += 2000;
  }

  const now = new Date();
  const expiration = new Date(year, month);

  return expiration > now;
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .trim();
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate webhook URL (must be HTTPS)
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(params: {
  count?: number;
  skip?: number;
}): { count: number; skip: number } {
  const count = Math.min(Math.max(params.count || 20, 1), 100);
  const skip = Math.max(params.skip || 0, 0);
  return { count, skip };
}

// Aliases for compatibility with different naming conventions
export const validateRoutingNumber = isValidRoutingNumber;
export const validateAccountNumber = isValidAccountNumber;
export const validateEmail = isValidEmail;
export const validatePhone = isValidPhoneNumber;
export const validateCardNumber = isValidCardNumber;
export const validateAmount = isValidAmount;
export const validateAccountId = isValidUUID;
export const validateUrl = isValidUrl;
export const validateStateCode = isValidStateCode;

// Additional validation functions
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return startDate <= endDate;
}
export const validateDateRange = isValidDateRange;

export function isValidCountryCode(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}
export const validateCountryCode = isValidCountryCode;

export function isValidPostalCode(postalCode: string, country: string = 'US'): boolean {
  if (country === 'US') {
    return /^\d{5}(-\d{4})?$/.test(postalCode);
  }
  if (country === 'GB') {
    return /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(postalCode);
  }
  return postalCode.length > 0;
}
export const validatePostalCode = isValidPostalCode;

export function isValidTaxId(taxId: string, type: 'EIN' | 'SSN' | 'ITIN'): boolean {
  if (type === 'EIN') {
    return /^\d{2}-\d{7}$/.test(taxId);
  }
  if (type === 'SSN') {
    return /^\d{3}-\d{2}-\d{4}$/.test(taxId);
  }
  if (type === 'ITIN') {
    return /^9\d{2}-\d{2}-\d{4}$/.test(taxId);
  }
  return false;
}
export const validateTaxId = isValidTaxId;
