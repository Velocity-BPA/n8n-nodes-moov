/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as crypto from 'crypto';

/**
 * Signature Utilities for Moov Webhook Verification
 *
 * Moov uses HMAC-SHA512 signatures to verify webhook authenticity.
 * Always verify signatures before processing webhook payloads.
 */

/**
 * Moov webhook signature header name
 */
export const MOOV_SIGNATURE_HEADER = 'moov-signature';

/**
 * Moov timestamp header name
 */
export const MOOV_TIMESTAMP_HEADER = 'moov-timestamp';

/**
 * Moov webhook ID header name
 */
export const MOOV_WEBHOOK_ID_HEADER = 'moov-webhook-id';

/**
 * Maximum age of webhook in seconds (5 minutes)
 */
export const MAX_WEBHOOK_AGE_SECONDS = 300;

/**
 * Webhook verification result
 */
export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
  webhookId?: string;
  timestamp?: number;
}

/**
 * Compute HMAC-SHA512 signature
 */
export function computeSignature(
  payload: string | Buffer,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha512',
): string {
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Compare signatures in constant time to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Parse Moov signature header
 * Format: t=timestamp,v1=signature
 */
export function parseSignatureHeader(signatureHeader: string): {
  timestamp?: number;
  signature?: string;
} {
  const parts = signatureHeader.split(',');
  const result: { timestamp?: number; signature?: string } = {};

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      result.timestamp = parseInt(value, 10);
    } else if (key === 'v1') {
      result.signature = value;
    }
  }

  return result;
}

/**
 * Build signed payload for verification
 */
export function buildSignedPayload(timestamp: number, payload: string): string {
  return `${timestamp}.${payload}`;
}

/**
 * Verify Moov webhook signature
 *
 * @param payload - Raw request body (string or Buffer)
 * @param signatureHeader - Value of moov-signature header
 * @param secret - Webhook signing secret
 * @param webhookId - Value of moov-webhook-id header (optional)
 * @returns Verification result
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signatureHeader: string,
  secret: string,
  webhookId?: string,
): WebhookVerificationResult {
  if (!signatureHeader) {
    return {
      isValid: false,
      error: 'Missing signature header',
    };
  }

  if (!secret) {
    return {
      isValid: false,
      error: 'Missing webhook secret',
    };
  }

  const { timestamp, signature } = parseSignatureHeader(signatureHeader);

  if (!timestamp) {
    return {
      isValid: false,
      error: 'Missing timestamp in signature header',
    };
  }

  if (!signature) {
    return {
      isValid: false,
      error: 'Missing signature in header',
    };
  }

  // Check if webhook is too old (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  const age = now - timestamp;

  if (age > MAX_WEBHOOK_AGE_SECONDS) {
    return {
      isValid: false,
      error: `Webhook is too old (${age} seconds)`,
      timestamp,
      webhookId,
    };
  }

  if (age < 0) {
    return {
      isValid: false,
      error: 'Webhook timestamp is in the future',
      timestamp,
      webhookId,
    };
  }

  // Build the signed payload and compute expected signature
  const payloadString = typeof payload === 'string' ? payload : payload.toString('utf-8');
  const signedPayload = buildSignedPayload(timestamp, payloadString);
  const expectedSignature = computeSignature(signedPayload, secret);

  // Compare signatures securely
  const isValid = secureCompare(signature, expectedSignature);

  return {
    isValid,
    error: isValid ? undefined : 'Invalid signature',
    timestamp,
    webhookId,
  };
}

/**
 * Create a webhook signature (for testing purposes)
 */
export function createWebhookSignature(
  payload: string,
  secret: string,
  timestamp?: number,
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = buildSignedPayload(ts, payload);
  const signature = computeSignature(signedPayload, secret);
  return `t=${ts},v1=${signature}`;
}

/**
 * Generate a random webhook secret
 */
export function generateWebhookSecret(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for comparison (e.g., idempotency keys)
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate idempotency key
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Verify request hasn't been tampered with
 */
export function verifyRequestIntegrity(
  body: string,
  expectedHash: string,
  algorithm: 'sha256' | 'sha512' = 'sha256',
): boolean {
  const actualHash = crypto.createHash(algorithm).update(body).digest('hex');
  return secureCompare(actualHash, expectedHash);
}

/**
 * Extract webhook event data safely
 */
export function extractWebhookEvent<T>(payload: string): T | null {
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

/**
 * Webhook event structure
 */
export interface MoovWebhookEvent {
  eventID: string;
  type: string;
  data: Record<string, unknown>;
  createdOn: string;
  accountID?: string;
  webhookID?: string;
}

/**
 * Parse and validate webhook event
 */
export function parseWebhookEvent(payload: string): MoovWebhookEvent | null {
  try {
    const event = JSON.parse(payload);

    if (!event.eventID || !event.type || !event.data) {
      return null;
    }

    return event as MoovWebhookEvent;
  } catch {
    return null;
  }
}
