/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Moov Capability Types
 *
 * Capabilities are features that can be enabled on a Moov account.
 * Each capability requires specific verification and compliance steps.
 */

export const CAPABILITY_TYPES = {
  /** Ability to send funds via various payment rails */
  TRANSFERS: 'transfers',

  /** Ability to link and receive funds from bank accounts */
  SEND_FUNDS: 'send-funds',

  /** Ability to receive funds into the account */
  COLLECT_FUNDS: 'collect-funds',

  /** Ability to hold funds in a Moov wallet */
  WALLET: 'wallet',

  /** Ability to link and charge credit/debit cards */
  CARD_ISSUING: 'card-issuing',
} as const;

export type CapabilityType = (typeof CAPABILITY_TYPES)[keyof typeof CAPABILITY_TYPES];

/**
 * Capability Status Values
 */
export const CAPABILITY_STATUS = {
  /** Capability is active and usable */
  ENABLED: 'enabled',

  /** Capability has been requested but not yet approved */
  PENDING: 'pending',

  /** Capability request was denied */
  DISABLED: 'disabled',

  /** Capability requires additional information */
  IN_REVIEW: 'in-review',
} as const;

export type CapabilityStatus = (typeof CAPABILITY_STATUS)[keyof typeof CAPABILITY_STATUS];

/**
 * Capability Display Names for UI
 */
export const CAPABILITY_DISPLAY_NAMES: Record<string, string> = {
  [CAPABILITY_TYPES.TRANSFERS]: 'Transfers',
  [CAPABILITY_TYPES.SEND_FUNDS]: 'Send Funds',
  [CAPABILITY_TYPES.COLLECT_FUNDS]: 'Collect Funds',
  [CAPABILITY_TYPES.WALLET]: 'Wallet',
  [CAPABILITY_TYPES.CARD_ISSUING]: 'Card Issuing',
};

/**
 * Capability Requirements
 * Documents and information required for each capability
 */
export const CAPABILITY_REQUIREMENTS = {
  [CAPABILITY_TYPES.TRANSFERS]: [
    'business-verification',
    'representative-verification',
    'bank-account',
  ],
  [CAPABILITY_TYPES.SEND_FUNDS]: [
    'business-verification',
    'representative-verification',
    'bank-account',
  ],
  [CAPABILITY_TYPES.COLLECT_FUNDS]: [
    'business-verification',
    'representative-verification',
  ],
  [CAPABILITY_TYPES.WALLET]: [
    'business-verification',
    'representative-verification',
  ],
  [CAPABILITY_TYPES.CARD_ISSUING]: [
    'business-verification',
    'representative-verification',
    'underwriting-approval',
  ],
} as const;

/**
 * n8n Options for capability selection
 */
export const CAPABILITY_OPTIONS = [
  {
    name: 'Transfers',
    value: CAPABILITY_TYPES.TRANSFERS,
    description: 'Ability to send funds via various payment rails',
  },
  {
    name: 'Send Funds',
    value: CAPABILITY_TYPES.SEND_FUNDS,
    description: 'Ability to link and receive funds from bank accounts',
  },
  {
    name: 'Collect Funds',
    value: CAPABILITY_TYPES.COLLECT_FUNDS,
    description: 'Ability to receive funds into the account',
  },
  {
    name: 'Wallet',
    value: CAPABILITY_TYPES.WALLET,
    description: 'Ability to hold funds in a Moov wallet',
  },
  {
    name: 'Card Issuing',
    value: CAPABILITY_TYPES.CARD_ISSUING,
    description: 'Ability to link and charge credit/debit cards',
  },
];

/**
 * Capability Status Options for n8n
 */
// Alias for backwards compatibility
export const CAPABILITY_STATUSES = CAPABILITY_STATUS;

export const CAPABILITY_STATUS_OPTIONS = [
  {
    name: 'Enabled',
    value: CAPABILITY_STATUS.ENABLED,
    description: 'Capability is active and usable',
  },
  {
    name: 'Pending',
    value: CAPABILITY_STATUS.PENDING,
    description: 'Capability has been requested but not yet approved',
  },
  {
    name: 'Disabled',
    value: CAPABILITY_STATUS.DISABLED,
    description: 'Capability request was denied',
  },
  {
    name: 'In Review',
    value: CAPABILITY_STATUS.IN_REVIEW,
    description: 'Capability requires additional information',
  },
];
