/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Token Utilities for Moov API
 *
 * Handles scoped access token management for fine-grained permissions.
 */

import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../constants/endpoints';
import type { MoovCredentials } from './authUtils';
import { buildBasicAuthHeader } from './authUtils';

/**
 * Token response from Moov OAuth
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

/**
 * Cached token with metadata
 */
export interface CachedToken {
  accessToken: string;
  expiresAt: number;
  scope: string;
  accountId?: string;
}

/**
 * Token cache (in-memory)
 */
const tokenCache = new Map<string, CachedToken>();

/**
 * Generate cache key for token
 */
function generateCacheKey(credentials: MoovCredentials, scope: string, accountId?: string): string {
  return `${credentials.publicKey}:${scope}:${accountId || 'facilitator'}`;
}

/**
 * Check if cached token is still valid
 */
function isTokenValid(cached: CachedToken): boolean {
  // Consider token expired 60 seconds before actual expiration
  return cached.expiresAt > Date.now() + 60000;
}

/**
 * Request a new access token from Moov
 */
export async function requestAccessToken(
  credentials: MoovCredentials,
  scope: string,
  accountId?: string,
): Promise<TokenResponse> {
  const baseUrl = getApiBaseUrl(credentials.environment, credentials.customApiUrl);
  const tokenUrl = `${baseUrl}/oauth2/token`;

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope,
  });

  if (accountId) {
    params.append('account_id', accountId);
  }

  const response: AxiosResponse<TokenResponse> = await axios.post(tokenUrl, params.toString(), {
    headers: {
      Authorization: buildBasicAuthHeader(credentials.publicKey, credentials.secretKey),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

/**
 * Get or create access token (with caching)
 */
export async function getAccessToken(
  credentials: MoovCredentials,
  scope: string,
  accountId?: string,
): Promise<string> {
  const cacheKey = generateCacheKey(credentials, scope, accountId);
  const cached = tokenCache.get(cacheKey);

  if (cached && isTokenValid(cached)) {
    return cached.accessToken;
  }

  const tokenResponse = await requestAccessToken(credentials, scope, accountId);

  const cachedToken: CachedToken = {
    accessToken: tokenResponse.access_token,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    scope: tokenResponse.scope,
    accountId,
  };

  tokenCache.set(cacheKey, cachedToken);

  return tokenResponse.access_token;
}

/**
 * Clear token from cache
 */
export function clearTokenCache(
  credentials: MoovCredentials,
  scope: string,
  accountId?: string,
): void {
  const cacheKey = generateCacheKey(credentials, scope, accountId);
  tokenCache.delete(cacheKey);
}

/**
 * Clear all cached tokens
 */
export function clearAllTokens(): void {
  tokenCache.clear();
}

/**
 * Parse scope string to array
 */
export function parseScopeString(scopeString: string): string[] {
  return scopeString
    .split(' ')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Build scope string from array
 */
export function buildScopeString(scopes: string[]): string {
  return scopes.join(' ');
}

/**
 * Get minimum required scopes for a resource operation
 */
export function getRequiredScopes(resource: string, operation: string): string[] {
  const scopeMap: Record<string, Record<string, string[]>> = {
    account: {
      read: ['/accounts.read'],
      write: ['/accounts.read', '/accounts.write'],
    },
    bankAccount: {
      read: ['/bank-accounts.read'],
      write: ['/bank-accounts.read', '/bank-accounts.write'],
    },
    card: {
      read: ['/cards.read'],
      write: ['/cards.read', '/cards.write'],
    },
    transfer: {
      read: ['/transfers.read'],
      write: ['/transfers.read', '/transfers.write'],
    },
    wallet: {
      read: ['/wallets.read'],
    },
    capability: {
      read: ['/capabilities.read'],
      write: ['/capabilities.read', '/capabilities.write'],
    },
    representative: {
      read: ['/representatives.read'],
      write: ['/representatives.read', '/representatives.write'],
    },
    underwriting: {
      read: ['/underwriting.read'],
      write: ['/underwriting.read', '/underwriting.write'],
    },
    document: {
      read: ['/documents.read'],
      write: ['/documents.read', '/documents.write'],
    },
    webhook: {
      read: ['/webhooks.read'],
      write: ['/webhooks.read', '/webhooks.write'],
    },
    paymentMethod: {
      read: ['/payment-methods.read'],
    },
  };

  const resourceScopes = scopeMap[resource];
  if (!resourceScopes) {
    return [];
  }

  // Determine read or write based on operation
  const isWriteOp = ['create', 'update', 'delete', 'link', 'initiate'].some((op) =>
    operation.toLowerCase().includes(op),
  );

  return isWriteOp ? resourceScopes.write || resourceScopes.read : resourceScopes.read;
}

/**
 * Token info for display
 */
export interface TokenInfo {
  hasToken: boolean;
  expiresIn?: number;
  scope?: string;
  accountId?: string;
}

/**
 * Get info about cached token
 */
export function getTokenInfo(
  credentials: MoovCredentials,
  scope: string,
  accountId?: string,
): TokenInfo {
  const cacheKey = generateCacheKey(credentials, scope, accountId);
  const cached = tokenCache.get(cacheKey);

  if (!cached) {
    return { hasToken: false };
  }

  return {
    hasToken: true,
    expiresIn: Math.max(0, Math.floor((cached.expiresAt - Date.now()) / 1000)),
    scope: cached.scope,
    accountId: cached.accountId,
  };
}

/**
 * Refresh token if near expiration
 */
export async function refreshIfNeeded(
  credentials: MoovCredentials,
  scope: string,
  accountId?: string,
  thresholdSeconds = 300,
): Promise<string> {
  const cacheKey = generateCacheKey(credentials, scope, accountId);
  const cached = tokenCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now() + thresholdSeconds * 1000) {
    return cached.accessToken;
  }

  // Token is expired or will expire soon, get a new one
  return getAccessToken(credentials, scope, accountId);
}
