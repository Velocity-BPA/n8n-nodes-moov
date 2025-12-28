/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Moov Transfer Types
 *
 * Different payment rails and methods available for transferring funds.
 */

export const TRANSFER_TYPES = {
  /** Automated Clearing House - bank to bank */
  ACH_DEBIT_FUND: 'ach-debit-fund',
  ACH_DEBIT_COLLECT: 'ach-debit-collect',
  ACH_CREDIT_STANDARD: 'ach-credit-standard',
  ACH_CREDIT_SAME_DAY: 'ach-credit-same-day',

  /** Card payments */
  CARD_PAYMENT: 'card-payment',

  /** Push to card (instant disbursement) */
  PUSH_TO_CARD: 'push-to-card',

  /** Real-time payments */
  RTP_CREDIT: 'rtp-credit',

  /** Wallet transfers */
  MOOV_WALLET: 'moov-wallet',

  /** Wire transfers */
  WIRE: 'wire',
} as const;

export type TransferType = (typeof TRANSFER_TYPES)[keyof typeof TRANSFER_TYPES];

/**
 * Transfer Status Values
 */
export const TRANSFER_STATUS = {
  /** Transfer has been created */
  CREATED: 'created',

  /** Transfer is pending processing */
  PENDING: 'pending',

  /** Transfer is queued for processing */
  QUEUED: 'queued',

  /** Transfer is being processed */
  PROCESSING: 'processing',

  /** Transfer completed successfully */
  COMPLETED: 'completed',

  /** Transfer failed */
  FAILED: 'failed',

  /** Transfer was canceled */
  CANCELED: 'canceled',

  /** Transfer was reversed */
  REVERSED: 'reversed',

  /** Transfer was refunded */
  REFUNDED: 'refunded',
} as const;

export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];

// Alias for backwards compatibility
export const TRANSFER_STATUSES = TRANSFER_STATUS;

/**
 * Payment Method Types
 */
export const PAYMENT_METHOD_TYPES = {
  BANK_ACCOUNT: 'bank-account',
  CARD: 'card',
  WALLET: 'moov-wallet',
  APPLE_PAY: 'apple-pay',
  GOOGLE_PAY: 'google-pay',
} as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD_TYPES)[keyof typeof PAYMENT_METHOD_TYPES];

/**
 * Bank Account Status Values
 */
export const BANK_ACCOUNT_STATUS = {
  NEW: 'new',
  PENDING: 'pending',
  VERIFIED: 'verified',
  VERIFICATION_FAILED: 'verification-failed',
  ERRORED: 'errored',
} as const;

export type BankAccountStatus = (typeof BANK_ACCOUNT_STATUS)[keyof typeof BANK_ACCOUNT_STATUS];

/**
 * Bank Account Types
 */
export const BANK_ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
} as const;

export type BankAccountType = (typeof BANK_ACCOUNT_TYPES)[keyof typeof BANK_ACCOUNT_TYPES];

/**
 * Bank Account Holder Types
 */
export const BANK_ACCOUNT_HOLDER_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
} as const;

export type BankAccountHolderType = (typeof BANK_ACCOUNT_HOLDER_TYPES)[keyof typeof BANK_ACCOUNT_HOLDER_TYPES];

/**
 * Card Brands
 */
export const CARD_BRANDS = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMERICAN_EXPRESS: 'American Express',
  DISCOVER: 'Discover',
  DINERS_CLUB: 'Diners Club',
  JCB: 'JCB',
  UNIONPAY: 'UnionPay',
  UNKNOWN: 'Unknown',
} as const;

export type CardBrand = (typeof CARD_BRANDS)[keyof typeof CARD_BRANDS];

/**
 * Card Types
 */
export const CARD_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
  PREPAID: 'prepaid',
  UNKNOWN: 'unknown',
} as const;

export type CardType = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];

/**
 * Transfer Type Options for n8n
 */
export const TRANSFER_TYPE_OPTIONS = [
  {
    name: 'ACH Debit Fund',
    value: TRANSFER_TYPES.ACH_DEBIT_FUND,
    description: 'Pull funds from a bank account via ACH',
  },
  {
    name: 'ACH Debit Collect',
    value: TRANSFER_TYPES.ACH_DEBIT_COLLECT,
    description: 'Collect funds from a bank account via ACH',
  },
  {
    name: 'ACH Credit Standard',
    value: TRANSFER_TYPES.ACH_CREDIT_STANDARD,
    description: 'Push funds to a bank account via standard ACH (1-3 days)',
  },
  {
    name: 'ACH Credit Same Day',
    value: TRANSFER_TYPES.ACH_CREDIT_SAME_DAY,
    description: 'Push funds to a bank account via same-day ACH',
  },
  {
    name: 'Card Payment',
    value: TRANSFER_TYPES.CARD_PAYMENT,
    description: 'Charge a credit or debit card',
  },
  {
    name: 'Push to Card',
    value: TRANSFER_TYPES.PUSH_TO_CARD,
    description: 'Instant disbursement to a debit card',
  },
  {
    name: 'RTP Credit',
    value: TRANSFER_TYPES.RTP_CREDIT,
    description: 'Real-time payment to a bank account',
  },
  {
    name: 'Moov Wallet',
    value: TRANSFER_TYPES.MOOV_WALLET,
    description: 'Transfer between Moov wallets',
  },
  {
    name: 'Wire',
    value: TRANSFER_TYPES.WIRE,
    description: 'Wire transfer',
  },
];

/**
 * Transfer Status Options for n8n
 */
export const TRANSFER_STATUS_OPTIONS = [
  {
    name: 'Created',
    value: TRANSFER_STATUS.CREATED,
    description: 'Transfer has been created',
  },
  {
    name: 'Pending',
    value: TRANSFER_STATUS.PENDING,
    description: 'Transfer is pending processing',
  },
  {
    name: 'Queued',
    value: TRANSFER_STATUS.QUEUED,
    description: 'Transfer is queued for processing',
  },
  {
    name: 'Processing',
    value: TRANSFER_STATUS.PROCESSING,
    description: 'Transfer is being processed',
  },
  {
    name: 'Completed',
    value: TRANSFER_STATUS.COMPLETED,
    description: 'Transfer completed successfully',
  },
  {
    name: 'Failed',
    value: TRANSFER_STATUS.FAILED,
    description: 'Transfer failed',
  },
  {
    name: 'Canceled',
    value: TRANSFER_STATUS.CANCELED,
    description: 'Transfer was canceled',
  },
  {
    name: 'Reversed',
    value: TRANSFER_STATUS.REVERSED,
    description: 'Transfer was reversed',
  },
  {
    name: 'Refunded',
    value: TRANSFER_STATUS.REFUNDED,
    description: 'Transfer was refunded',
  },
];

/**
 * Bank Account Type Options for n8n
 */
export const BANK_ACCOUNT_TYPE_OPTIONS = [
  {
    name: 'Checking',
    value: BANK_ACCOUNT_TYPES.CHECKING,
    description: 'Checking account',
  },
  {
    name: 'Savings',
    value: BANK_ACCOUNT_TYPES.SAVINGS,
    description: 'Savings account',
  },
];

/**
 * Payment Method Type Options for n8n
 */
export const PAYMENT_METHOD_TYPE_OPTIONS = [
  {
    name: 'Bank Account',
    value: PAYMENT_METHOD_TYPES.BANK_ACCOUNT,
    description: 'Linked bank account',
  },
  {
    name: 'Card',
    value: PAYMENT_METHOD_TYPES.CARD,
    description: 'Credit or debit card',
  },
  {
    name: 'Moov Wallet',
    value: PAYMENT_METHOD_TYPES.WALLET,
    description: 'Moov wallet balance',
  },
  {
    name: 'Apple Pay',
    value: PAYMENT_METHOD_TYPES.APPLE_PAY,
    description: 'Apple Pay',
  },
  {
    name: 'Google Pay',
    value: PAYMENT_METHOD_TYPES.GOOGLE_PAY,
    description: 'Google Pay',
  },
];
