/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { getApiBaseUrl } from '../constants/endpoints';

/**
 * Authentication Utilities for Moov API
 */

export interface MoovCredentials {
  environment: 'production' | 'sandbox' | 'custom';
  customApiUrl?: string;
  accountId: string;
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
}

export interface MoovOAuthCredentials {
  environment: 'production' | 'sandbox';
  clientId: string;
  clientSecret: string;
  scope: string;
}

/**
 * Extract and validate Moov API credentials
 */
export function extractMoovCredentials(
  credentials: ICredentialDataDecryptedObject,
): MoovCredentials {
  const environment = credentials.environment as 'production' | 'sandbox' | 'custom';
  const customApiUrl = credentials.customApiUrl as string | undefined;
  const accountId = credentials.accountId as string;
  const publicKey = credentials.publicKey as string;
  const secretKey = credentials.secretKey as string;
  const webhookSecret = credentials.webhookSecret as string | undefined;

  if (!accountId) {
    throw new Error('Account ID is required');
  }

  if (!publicKey) {
    throw new Error('Public Key is required');
  }

  if (!secretKey) {
    throw new Error('Secret Key is required');
  }

  if (environment === 'custom' && !customApiUrl) {
    throw new Error('Custom API URL is required when using custom environment');
  }

  return {
    environment,
    customApiUrl,
    accountId,
    publicKey,
    secretKey,
    webhookSecret,
  };
}

/**
 * Get base URL from credentials
 */
export function getBaseUrlFromCredentials(credentials: MoovCredentials): string {
  return getApiBaseUrl(credentials.environment, credentials.customApiUrl);
}

/**
 * Build Basic Auth header value
 */
export function buildBasicAuthHeader(publicKey: string, secretKey: string): string {
  const credentials = `${publicKey}:${secretKey}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Build headers for Moov API request
 */
export function buildMoovHeaders(
  credentials: MoovCredentials,
  additionalHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: buildBasicAuthHeader(credentials.publicKey, credentials.secretKey),
    'Content-Type': 'application/json',
    'X-Account-ID': credentials.accountId,
    Accept: 'application/json',
  };

  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders);
  }

  return headers;
}

/**
 * Build headers with scoped access token
 */
export function buildScopedHeaders(
  accessToken: string,
  accountId?: string,
  additionalHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (accountId) {
    headers['X-Account-ID'] = accountId;
  }

  if (additionalHeaders) {
    Object.assign(headers, additionalHeaders);
  }

  return headers;
}

/**
 * Parse Bearer token from Authorization header
 */
export function parseBearerToken(authHeader: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Validate that a token is not expired
 * Note: This is a basic check - actual token validation should be done server-side
 */
export function isTokenExpired(expiresAt: string | number | Date): boolean {
  const expirationTime = new Date(expiresAt).getTime();
  const now = Date.now();
  // Add 60 second buffer for network latency
  return now >= expirationTime - 60000;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (!data || data.length <= visibleChars * 2) {
    return '****';
  }
  return `${data.substring(0, visibleChars)}****${data.substring(data.length - visibleChars)}`;
}

/**
 * Safe credentials object for logging (masks sensitive fields)
 */
export function getSafeCredentialsForLogging(credentials: MoovCredentials): Record<string, string> {
  return {
    environment: credentials.environment,
    accountId: maskSensitiveData(credentials.accountId),
    publicKey: maskSensitiveData(credentials.publicKey),
    secretKey: '********',
    webhookSecret: credentials.webhookSecret ? '********' : 'not set',
  };
}
