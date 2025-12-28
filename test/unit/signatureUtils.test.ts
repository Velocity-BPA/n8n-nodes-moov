/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  generateSignature,
  verifyWebhookSignature,
  createHmacSignature,
  validateTimestamp,
} from '../../nodes/Moov/utils/signatureUtils';

describe('SignatureUtils', () => {
  const secret = 'test-webhook-secret';
  const timestamp = '1640995200';
  const body = JSON.stringify({ event: 'test', data: { id: '123' } });

  describe('generateSignature', () => {
    it('should generate a consistent signature for the same input', () => {
      const signature1 = generateSignature(body, secret, timestamp);
      const signature2 = generateSignature(body, secret, timestamp);
      expect(signature1).toBe(signature2);
    });

    it('should generate different signatures for different bodies', () => {
      const signature1 = generateSignature(body, secret, timestamp);
      const signature2 = generateSignature('different body', secret, timestamp);
      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different secrets', () => {
      const signature1 = generateSignature(body, secret, timestamp);
      const signature2 = generateSignature(body, 'different-secret', timestamp);
      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different timestamps', () => {
      const signature1 = generateSignature(body, secret, timestamp);
      const signature2 = generateSignature(body, secret, '1640995201');
      expect(signature1).not.toBe(signature2);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify a valid signature', () => {
      const signature = generateSignature(body, secret, timestamp);
      const result = verifyWebhookSignature(body, signature, secret, timestamp);
      expect(result).toBe(true);
    });

    it('should reject an invalid signature', () => {
      const result = verifyWebhookSignature(body, 'invalid-signature', secret, timestamp);
      expect(result).toBe(false);
    });

    it('should reject a signature with wrong secret', () => {
      const signature = generateSignature(body, secret, timestamp);
      const result = verifyWebhookSignature(body, signature, 'wrong-secret', timestamp);
      expect(result).toBe(false);
    });

    it('should reject a signature with wrong timestamp', () => {
      const signature = generateSignature(body, secret, timestamp);
      const result = verifyWebhookSignature(body, signature, secret, '1640995201');
      expect(result).toBe(false);
    });
  });

  describe('createHmacSignature', () => {
    it('should create HMAC-SHA512 signature', () => {
      const signature = createHmacSignature(body, secret);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should create consistent signatures', () => {
      const signature1 = createHmacSignature(body, secret);
      const signature2 = createHmacSignature(body, secret);
      expect(signature1).toBe(signature2);
    });
  });

  describe('validateTimestamp', () => {
    it('should accept recent timestamps', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000).toString();
      const result = validateTimestamp(recentTimestamp, 300);
      expect(result).toBe(true);
    });

    it('should reject old timestamps', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000 - 600).toString();
      const result = validateTimestamp(oldTimestamp, 300);
      expect(result).toBe(false);
    });

    it('should reject future timestamps', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000 + 600).toString();
      const result = validateTimestamp(futureTimestamp, 300);
      expect(result).toBe(false);
    });
  });
});
