/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { IExecuteFunctions, ILoadOptionsFunctions, IHookFunctions } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { getApiBaseUrl, RESOURCE_PATHS } from '../constants/endpoints';
import type { MoovCredentials } from '../utils/authUtils';
import {
  extractMoovCredentials,
  buildMoovHeaders,
  buildScopedHeaders,
} from '../utils/authUtils';
import { getAccessToken } from '../utils/tokenUtils';

/**
 * Log licensing notice once per module load
 */
const LICENSING_NOTICE_LOGGED = false;
function logLicensingNotice(): void {
  if (!LICENSING_NOTICE_LOGGED) {
    console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
  }
}

// Log notice on module load
logLicensingNotice();

/**
 * Moov API Error Response
 */
export interface MoovApiError {
  error?: string;
  message?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Moov API Response with pagination
 */
export interface MoovPaginatedResponse<T> {
  data: T[];
  cursor?: string;
  hasMore?: boolean;
}

/**
 * Request options for Moov API
 */
export interface MoovRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  accountId?: string;
  scope?: string;
  useOAuth?: boolean;
}

/**
 * Create Axios instance for Moov API
 */
function createAxiosInstance(baseUrl: string): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

/**
 * Parse Moov API error response
 */
function parseApiError(error: AxiosError<MoovApiError>): string {
  if (error.response?.data) {
    const data = error.response.data;
    return data.message || data.error || JSON.stringify(data);
  }
  return error.message || 'Unknown API error';
}

/**
 * Build query string from parameters
 */
function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}

/**
 * Make authenticated request to Moov API
 */
export async function moovApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
  options: MoovRequestOptions,
): Promise<unknown> {
  const credentials = await this.getCredentials('moovApi');
  const moovCreds = extractMoovCredentials(credentials);
  const baseUrl = getApiBaseUrl(moovCreds.environment, moovCreds.customApiUrl);

  let headers: Record<string, string>;

  if (options.useOAuth && options.scope) {
    // Use scoped access token
    const accessToken = await getAccessToken(moovCreds, options.scope, options.accountId);
    headers = buildScopedHeaders(accessToken, options.accountId, options.headers);
  } else {
    // Use basic auth
    headers = buildMoovHeaders(moovCreds, options.headers);
  }

  // Override account ID if specified
  if (options.accountId) {
    headers['X-Account-ID'] = options.accountId;
  }

  const queryString = options.query ? buildQueryString(options.query) : '';
  const url = `${baseUrl}${options.endpoint}${queryString}`;

  const config: AxiosRequestConfig = {
    method: options.method,
    url,
    headers,
    data: options.body,
  };

  try {
    const response: AxiosResponse = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<MoovApiError>;
      const errorMessage = parseApiError(axiosError);
      const statusCode = axiosError.response?.status || 500;

      throw new NodeApiError(this.getNode(), {
        message: errorMessage,
        description: `Moov API request failed with status ${statusCode}`,
        httpCode: statusCode,
      });
    }
    throw error;
  }
}

/**
 * Make paginated request to Moov API
 */
export async function moovApiRequestAllItems<T>(
  this: IExecuteFunctions,
  options: MoovRequestOptions,
  itemsPropertyName = 'data',
): Promise<T[]> {
  const returnData: T[] = [];
  let cursor: string | undefined;

  do {
    const queryParams = {
      ...options.query,
      cursor,
    };

    const response = (await moovApiRequest.call(this, {
      ...options,
      query: queryParams,
    })) as Record<string, unknown>;

    const items = (response[itemsPropertyName] as T[]) || [];
    returnData.push(...items);

    // Check for pagination cursor
    cursor = response.cursor as string | undefined;

    // Also check for common pagination patterns
    if (!cursor && response.nextCursor) {
      cursor = response.nextCursor as string;
    }

    // Break if no more items or reached limit
    if (!cursor || items.length === 0) {
      break;
    }
  } while (cursor);

  return returnData;
}

/**
 * Moov client class for structured API access
 */
export class MoovClient {
  private credentials: MoovCredentials;
  private axiosInstance: AxiosInstance;

  constructor(credentials: MoovCredentials) {
    this.credentials = credentials;
    const baseUrl = getApiBaseUrl(credentials.environment, credentials.customApiUrl);
    this.axiosInstance = createAxiosInstance(baseUrl);
  }

  /**
   * Get headers for request
   */
  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return buildMoovHeaders(this.credentials, additionalHeaders);
  }

  /**
   * Make API request
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    options?: {
      body?: Record<string, unknown>;
      query?: Record<string, string | number | boolean | undefined>;
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    const queryString = options?.query ? buildQueryString(options.query) : '';
    const url = `${endpoint}${queryString}`;

    const config: AxiosRequestConfig = {
      method,
      url,
      headers: this.getHeaders(options?.headers),
      data: options?.body,
    };

    const response = await this.axiosInstance.request<T>(config);
    return response.data;
  }

  // Account methods
  async getAccount(accountId: string): Promise<unknown> {
    return this.request('GET', `${RESOURCE_PATHS.ACCOUNTS}/${accountId}`);
  }

  async listAccounts(query?: Record<string, string | number | boolean | undefined>): Promise<unknown> {
    return this.request('GET', RESOURCE_PATHS.ACCOUNTS, { query });
  }

  async createAccount(data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', RESOURCE_PATHS.ACCOUNTS, { body: data });
  }

  async updateAccount(accountId: string, data: Record<string, unknown>): Promise<unknown> {
    return this.request('PATCH', `${RESOURCE_PATHS.ACCOUNTS}/${accountId}`, { body: data });
  }

  // Transfer methods
  async getTransfer(transferId: string): Promise<unknown> {
    return this.request('GET', `${RESOURCE_PATHS.TRANSFERS}/${transferId}`);
  }

  async listTransfers(query?: Record<string, string | number | boolean | undefined>): Promise<unknown> {
    return this.request('GET', RESOURCE_PATHS.TRANSFERS, { query });
  }

  async createTransfer(data: Record<string, unknown>): Promise<unknown> {
    return this.request('POST', RESOURCE_PATHS.TRANSFERS, { body: data });
  }

  // Bank account methods
  async getBankAccount(accountId: string, bankAccountId: string): Promise<unknown> {
    return this.request(
      'GET',
      `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.BANK_ACCOUNTS}/${bankAccountId}`,
    );
  }

  async listBankAccounts(accountId: string): Promise<unknown> {
    return this.request(
      'GET',
      `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.BANK_ACCOUNTS}`,
    );
  }

  // Card methods
  async getCard(accountId: string, cardId: string): Promise<unknown> {
    return this.request(
      'GET',
      `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.CARDS}/${cardId}`,
    );
  }

  async listCards(accountId: string): Promise<unknown> {
    return this.request(
      'GET',
      `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.CARDS}`,
    );
  }

  // Wallet methods
  async getWallet(accountId: string, walletId: string): Promise<unknown> {
    return this.request(
      'GET',
      `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.WALLETS}/${walletId}`,
    );
  }

  async listWallets(accountId: string): Promise<unknown> {
    return this.request(
      'GET',
      `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.WALLETS}`,
    );
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccount(this.credentials.accountId);
      return true;
    } catch {
      return false;
    }
  }

  // Convenience methods for common HTTP verbs
  async get<T>(endpoint: string, options?: {
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  async post<T>(endpoint: string, body?: Record<string, unknown>, options?: {
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, body });
  }

  async put<T>(endpoint: string, body?: Record<string, unknown>, options?: {
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, body });
  }

  async patch<T>(endpoint: string, body?: Record<string, unknown>, options?: {
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, body });
  }

  async delete<T>(endpoint: string, options?: {
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
  }): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }

  // Get base URL
  getBaseUrl(): string {
    return getApiBaseUrl(this.credentials.environment, this.credentials.customApiUrl);
  }

  // Get credentials
  getCredentials(): MoovCredentials {
    return this.credentials;
  }

  // Initialize method for async setup if needed
  async initialize(): Promise<void> {
    // Placeholder for any async initialization
  }
}

/**
 * Create Moov client from n8n execution context
 */
export async function createMoovClient(
  context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<MoovClient> {
  const credentials = await context.getCredentials('moovApi');
  const moovCreds = extractMoovCredentials(credentials);
  return new MoovClient(moovCreds);
}
