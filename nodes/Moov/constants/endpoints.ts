/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Moov API Endpoints
 *
 * Base URLs and endpoint paths for the Moov payment platform.
 */

export const MOOV_API_ENDPOINTS = {
  /** Production API base URL */
  PRODUCTION: 'https://api.moov.io',

  /** Sandbox API base URL for testing */
  SANDBOX: 'https://api.sandbox.moov.io',

  /** API version */
  API_VERSION: 'v1',
} as const;

/**
 * API Resource Paths
 */
export const RESOURCE_PATHS = {
  // Account Management
  ACCOUNTS: '/accounts',
  CAPABILITIES: '/capabilities',
  REPRESENTATIVES: '/representatives',
  TERMS_OF_SERVICE: '/terms-of-service',
  COUNTRIES: '/countries',

  // Payment Methods
  BANK_ACCOUNTS: '/bank-accounts',
  CARDS: '/cards',
  WALLETS: '/wallets',
  PAYMENT_METHODS: '/payment-methods',

  // Transfers
  TRANSFERS: '/transfers',
  TRANSFER_OPTIONS: '/transfer-options',
  REFUNDS: '/refunds',
  DISPUTES: '/disputes',
  SCHEDULES: '/schedules',

  // Verification & Compliance
  UNDERWRITING: '/underwriting',
  VERIFICATION: '/verification',
  DOCUMENTS: '/documents',

  // Webhooks & Events
  WEBHOOKS: '/webhooks',
  EVENTS: '/events',

  // Utilities
  INSTITUTIONS: '/institutions',
  INDUSTRIES: '/industries',
  AVATARS: '/avatars',
  FILES: '/files',
  ENRICHMENT: '/enrichment',
  ANALYTICS: '/analytics',

  // Auth
  OAUTH_TOKEN: '/oauth2/token',
  ACCESS_TOKENS: '/access-tokens',

  // Onboarding
  ONBOARDING: '/onboarding',
} as const;

/**
 * Get the full API URL for a given environment
 */
export function getApiBaseUrl(environment: 'production' | 'sandbox' | 'custom', customUrl?: string): string {
  switch (environment) {
    case 'production':
      return MOOV_API_ENDPOINTS.PRODUCTION;
    case 'sandbox':
      return MOOV_API_ENDPOINTS.SANDBOX;
    case 'custom':
      return customUrl || MOOV_API_ENDPOINTS.SANDBOX;
    default:
      return MOOV_API_ENDPOINTS.SANDBOX;
  }
}

/**
 * Build a full endpoint URL
 */
export function buildEndpoint(basePath: string, ...segments: string[]): string {
  const cleanSegments = segments.filter(Boolean).map((s) => s.replace(/^\/|\/$/g, ''));
  return `${basePath}/${cleanSegments.join('/')}`;
}
