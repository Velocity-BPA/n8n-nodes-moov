/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Moov OAuth Scopes
 *
 * Scopes define what resources and actions an access token can perform.
 * Use minimal scopes for better security.
 *
 * @see https://docs.moov.io/guides/get-started/authentication/scopes/
 */

export const OAUTH_SCOPES = {
  // Account Scopes
  ACCOUNTS_READ: '/accounts.read',
  ACCOUNTS_WRITE: '/accounts.write',

  // Bank Account Scopes
  BANK_ACCOUNTS_READ: '/bank-accounts.read',
  BANK_ACCOUNTS_WRITE: '/bank-accounts.write',

  // Card Scopes
  CARDS_READ: '/cards.read',
  CARDS_WRITE: '/cards.write',

  // Capability Scopes
  CAPABILITIES_READ: '/capabilities.read',
  CAPABILITIES_WRITE: '/capabilities.write',

  // Transfer Scopes
  TRANSFERS_READ: '/transfers.read',
  TRANSFERS_WRITE: '/transfers.write',

  // Wallet Scopes
  WALLETS_READ: '/wallets.read',

  // Payment Method Scopes
  PAYMENT_METHODS_READ: '/payment-methods.read',

  // Representative Scopes
  REPRESENTATIVES_READ: '/representatives.read',
  REPRESENTATIVES_WRITE: '/representatives.write',

  // Underwriting Scopes
  UNDERWRITING_READ: '/underwriting.read',
  UNDERWRITING_WRITE: '/underwriting.write',

  // Document Scopes
  DOCUMENTS_READ: '/documents.read',
  DOCUMENTS_WRITE: '/documents.write',

  // Webhook Scopes
  WEBHOOKS_READ: '/webhooks.read',
  WEBHOOKS_WRITE: '/webhooks.write',

  // Profile Scopes
  PROFILE_READ: '/profile.read',
  PROFILE_WRITE: '/profile.write',

  // Fed Scopes (Institution lookup)
  FED_READ: '/fed.read',
} as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[keyof typeof OAUTH_SCOPES];

/**
 * Scope Groups for Common Use Cases
 */
export const SCOPE_GROUPS = {
  /** Full account management */
  ACCOUNT_MANAGEMENT: [
    OAUTH_SCOPES.ACCOUNTS_READ,
    OAUTH_SCOPES.ACCOUNTS_WRITE,
    OAUTH_SCOPES.CAPABILITIES_READ,
    OAUTH_SCOPES.CAPABILITIES_WRITE,
    OAUTH_SCOPES.REPRESENTATIVES_READ,
    OAUTH_SCOPES.REPRESENTATIVES_WRITE,
  ],

  /** Payment method management */
  PAYMENT_METHODS: [
    OAUTH_SCOPES.BANK_ACCOUNTS_READ,
    OAUTH_SCOPES.BANK_ACCOUNTS_WRITE,
    OAUTH_SCOPES.CARDS_READ,
    OAUTH_SCOPES.CARDS_WRITE,
    OAUTH_SCOPES.PAYMENT_METHODS_READ,
  ],

  /** Transfer operations */
  TRANSFERS: [
    OAUTH_SCOPES.TRANSFERS_READ,
    OAUTH_SCOPES.TRANSFERS_WRITE,
    OAUTH_SCOPES.WALLETS_READ,
  ],

  /** Read-only access */
  READ_ONLY: [
    OAUTH_SCOPES.ACCOUNTS_READ,
    OAUTH_SCOPES.BANK_ACCOUNTS_READ,
    OAUTH_SCOPES.CARDS_READ,
    OAUTH_SCOPES.CAPABILITIES_READ,
    OAUTH_SCOPES.TRANSFERS_READ,
    OAUTH_SCOPES.WALLETS_READ,
    OAUTH_SCOPES.PAYMENT_METHODS_READ,
  ],

  /** Full access */
  FULL_ACCESS: Object.values(OAUTH_SCOPES),
} as const;

/**
 * Scope Options for n8n UI
 */
export const SCOPE_OPTIONS = [
  // Account
  { name: 'Accounts Read', value: OAUTH_SCOPES.ACCOUNTS_READ },
  { name: 'Accounts Write', value: OAUTH_SCOPES.ACCOUNTS_WRITE },

  // Bank Accounts
  { name: 'Bank Accounts Read', value: OAUTH_SCOPES.BANK_ACCOUNTS_READ },
  { name: 'Bank Accounts Write', value: OAUTH_SCOPES.BANK_ACCOUNTS_WRITE },

  // Cards
  { name: 'Cards Read', value: OAUTH_SCOPES.CARDS_READ },
  { name: 'Cards Write', value: OAUTH_SCOPES.CARDS_WRITE },

  // Capabilities
  { name: 'Capabilities Read', value: OAUTH_SCOPES.CAPABILITIES_READ },
  { name: 'Capabilities Write', value: OAUTH_SCOPES.CAPABILITIES_WRITE },

  // Transfers
  { name: 'Transfers Read', value: OAUTH_SCOPES.TRANSFERS_READ },
  { name: 'Transfers Write', value: OAUTH_SCOPES.TRANSFERS_WRITE },

  // Wallets
  { name: 'Wallets Read', value: OAUTH_SCOPES.WALLETS_READ },

  // Payment Methods
  { name: 'Payment Methods Read', value: OAUTH_SCOPES.PAYMENT_METHODS_READ },

  // Representatives
  { name: 'Representatives Read', value: OAUTH_SCOPES.REPRESENTATIVES_READ },
  { name: 'Representatives Write', value: OAUTH_SCOPES.REPRESENTATIVES_WRITE },

  // Underwriting
  { name: 'Underwriting Read', value: OAUTH_SCOPES.UNDERWRITING_READ },
  { name: 'Underwriting Write', value: OAUTH_SCOPES.UNDERWRITING_WRITE },

  // Documents
  { name: 'Documents Read', value: OAUTH_SCOPES.DOCUMENTS_READ },
  { name: 'Documents Write', value: OAUTH_SCOPES.DOCUMENTS_WRITE },

  // Webhooks
  { name: 'Webhooks Read', value: OAUTH_SCOPES.WEBHOOKS_READ },
  { name: 'Webhooks Write', value: OAUTH_SCOPES.WEBHOOKS_WRITE },

  // Profile
  { name: 'Profile Read', value: OAUTH_SCOPES.PROFILE_READ },
  { name: 'Profile Write', value: OAUTH_SCOPES.PROFILE_WRITE },

  // Fed
  { name: 'Fed Read', value: OAUTH_SCOPES.FED_READ },
];

/**
 * Build scope string from array of scopes
 */
export function buildScopeString(scopes: string[] | OAuthScope[]): string {
  return scopes.join(' ');
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
 * Validate if a scope string contains valid scopes
 */
export function validateScopes(scopeString: string): boolean {
  const scopes = parseScopeString(scopeString);
  const validScopes = Object.values(OAUTH_SCOPES);
  return scopes.every((scope) => validScopes.includes(scope as OAuthScope));
}
