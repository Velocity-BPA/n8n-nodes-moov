/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { getApiBaseUrl } from '../constants/endpoints';
import type { MoovCredentials } from '../utils/authUtils';
import { buildBasicAuthHeader } from '../utils/authUtils';
import { parseScopeString, buildScopeString } from '../constants/scopes';

/**
 * OAuth Token Response
 */
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

/**
 * OAuth Error Response
 */
export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
}

/**
 * Scoped Token Request
 */
export interface ScopedTokenRequest {
  scopes: string[];
  accountId?: string;
}

/**
 * OAuth Handler for Moov API
 *
 * Handles OAuth 2.0 authentication and token management.
 */
export class OAuthHandler {
  private credentials: MoovCredentials;
  private baseUrl: string;

  constructor(credentials: MoovCredentials) {
    this.credentials = credentials;
    this.baseUrl = getApiBaseUrl(credentials.environment, credentials.customApiUrl);
  }

  /**
   * Get client credentials token
   */
  async getClientCredentialsToken(scopes: string[]): Promise<OAuthTokenResponse> {
    const tokenUrl = `${this.baseUrl}/oauth2/token`;
    const scopeString = buildScopeString(scopes);

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: scopeString,
    });

    const response: AxiosResponse<OAuthTokenResponse> = await axios.post(
      tokenUrl,
      params.toString(),
      {
        headers: {
          Authorization: buildBasicAuthHeader(
            this.credentials.publicKey,
            this.credentials.secretKey,
          ),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  }

  /**
   * Get scoped access token for a specific account
   */
  async getScopedToken(request: ScopedTokenRequest): Promise<OAuthTokenResponse> {
    const tokenUrl = `${this.baseUrl}/oauth2/token`;
    const scopeString = buildScopeString(request.scopes);

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: scopeString,
    });

    if (request.accountId) {
      params.append('account_id', request.accountId);
    }

    const response: AxiosResponse<OAuthTokenResponse> = await axios.post(
      tokenUrl,
      params.toString(),
      {
        headers: {
          Authorization: buildBasicAuthHeader(
            this.credentials.publicKey,
            this.credentials.secretKey,
          ),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  }

  /**
   * Refresh an existing token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokenResponse> {
    const tokenUrl = `${this.baseUrl}/oauth2/token`;

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response: AxiosResponse<OAuthTokenResponse> = await axios.post(
      tokenUrl,
      params.toString(),
      {
        headers: {
          Authorization: buildBasicAuthHeader(
            this.credentials.publicKey,
            this.credentials.secretKey,
          ),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  }

  /**
   * Revoke an access token
   */
  async revokeToken(token: string): Promise<void> {
    const revokeUrl = `${this.baseUrl}/oauth2/revoke`;

    const params = new URLSearchParams({
      token,
    });

    await axios.post(revokeUrl, params.toString(), {
      headers: {
        Authorization: buildBasicAuthHeader(
          this.credentials.publicKey,
          this.credentials.secretKey,
        ),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Introspect a token to get its details
   */
  async introspectToken(token: string): Promise<{
    active: boolean;
    scope?: string;
    exp?: number;
    sub?: string;
  }> {
    const introspectUrl = `${this.baseUrl}/oauth2/introspect`;

    const params = new URLSearchParams({
      token,
    });

    const response = await axios.post(introspectUrl, params.toString(), {
      headers: {
        Authorization: buildBasicAuthHeader(
          this.credentials.publicKey,
          this.credentials.secretKey,
        ),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  }

  /**
   * Parse scope string from token response
   */
  parseScopes(token: OAuthTokenResponse): string[] {
    return parseScopeString(token.scope);
  }

  /**
   * Check if token has required scope
   */
  hasScope(token: OAuthTokenResponse, requiredScope: string): boolean {
    const scopes = this.parseScopes(token);
    return scopes.includes(requiredScope);
  }

  /**
   * Check if token has all required scopes
   */
  hasAllScopes(token: OAuthTokenResponse, requiredScopes: string[]): boolean {
    const scopes = this.parseScopes(token);
    return requiredScopes.every((scope) => scopes.includes(scope));
  }

  /**
   * Calculate token expiration time
   */
  getExpirationTime(token: OAuthTokenResponse): Date {
    return new Date(Date.now() + token.expires_in * 1000);
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(token: OAuthTokenResponse, bufferSeconds = 60): boolean {
    const expirationTime = this.getExpirationTime(token).getTime();
    return Date.now() >= expirationTime - bufferSeconds * 1000;
  }
}

/**
 * Token Manager for caching and auto-refreshing tokens
 */
export class TokenManager {
  private oauthHandler: OAuthHandler;
  private tokenCache: Map<string, { token: OAuthTokenResponse; expiresAt: number }>;
  private refreshThreshold: number;

  constructor(credentials: MoovCredentials, refreshThreshold = 300) {
    this.oauthHandler = new OAuthHandler(credentials);
    this.tokenCache = new Map();
    this.refreshThreshold = refreshThreshold; // seconds before expiration to refresh
  }

  /**
   * Generate cache key
   */
  private getCacheKey(scopes: string[], accountId?: string): string {
    const scopeKey = scopes.sort().join(',');
    return accountId ? `${accountId}:${scopeKey}` : scopeKey;
  }

  /**
   * Get valid token (from cache or new)
   */
  async getToken(scopes: string[], accountId?: string): Promise<string> {
    const cacheKey = this.getCacheKey(scopes, accountId);
    const cached = this.tokenCache.get(cacheKey);

    // Check if cached token is still valid
    if (cached && cached.expiresAt > Date.now() + this.refreshThreshold * 1000) {
      return cached.token.access_token;
    }

    // Get new token
    const token = await this.oauthHandler.getScopedToken({ scopes, accountId });

    // Cache the token
    this.tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + token.expires_in * 1000,
    });

    return token.access_token;
  }

  /**
   * Clear token from cache
   */
  clearToken(scopes: string[], accountId?: string): void {
    const cacheKey = this.getCacheKey(scopes, accountId);
    this.tokenCache.delete(cacheKey);
  }

  /**
   * Clear all cached tokens
   */
  clearAllTokens(): void {
    this.tokenCache.clear();
  }

  /**
   * Get token info
   */
  getTokenInfo(
    scopes: string[],
    accountId?: string,
  ): { hasToken: boolean; expiresIn?: number } {
    const cacheKey = this.getCacheKey(scopes, accountId);
    const cached = this.tokenCache.get(cacheKey);

    if (!cached) {
      return { hasToken: false };
    }

    return {
      hasToken: true,
      expiresIn: Math.max(0, Math.floor((cached.expiresAt - Date.now()) / 1000)),
    };
  }
}
