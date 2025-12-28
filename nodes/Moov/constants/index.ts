/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export * from './endpoints';
export * from './capabilities';
export * from './transferTypes';
export * from './eventTypes';
export * from './scopes';

/**
 * Account Types
 */
export const ACCOUNT_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

export const ACCOUNT_TYPE_OPTIONS = [
  {
    name: 'Individual',
    value: ACCOUNT_TYPES.INDIVIDUAL,
    description: 'Personal account for individuals',
  },
  {
    name: 'Business',
    value: ACCOUNT_TYPES.BUSINESS,
    description: 'Business or organization account',
  },
];

/**
 * Business Types
 */
export const BUSINESS_TYPES = {
  SOLE_PROPRIETORSHIP: 'soleProprietorship',
  UNINCORPORATED_ASSOCIATION: 'unincorporatedAssociation',
  TRUST: 'trust',
  PUBLIC_CORPORATION: 'publicCorporation',
  PRIVATE_CORPORATION: 'privateCorporation',
  LLC: 'llc',
  PARTNERSHIP: 'partnership',
  UNINCORPORATED_NONPROFIT: 'unincorporatedNonProfit',
  INCORPORATED_NONPROFIT: 'incorporatedNonProfit',
  GOVERNMENT_ENTITY: 'governmentEntity',
} as const;

export type BusinessType = (typeof BUSINESS_TYPES)[keyof typeof BUSINESS_TYPES];

export const BUSINESS_TYPE_OPTIONS = [
  { name: 'Sole Proprietorship', value: BUSINESS_TYPES.SOLE_PROPRIETORSHIP },
  { name: 'Unincorporated Association', value: BUSINESS_TYPES.UNINCORPORATED_ASSOCIATION },
  { name: 'Trust', value: BUSINESS_TYPES.TRUST },
  { name: 'Public Corporation', value: BUSINESS_TYPES.PUBLIC_CORPORATION },
  { name: 'Private Corporation', value: BUSINESS_TYPES.PRIVATE_CORPORATION },
  { name: 'LLC', value: BUSINESS_TYPES.LLC },
  { name: 'Partnership', value: BUSINESS_TYPES.PARTNERSHIP },
  { name: 'Unincorporated Non-Profit', value: BUSINESS_TYPES.UNINCORPORATED_NONPROFIT },
  { name: 'Incorporated Non-Profit', value: BUSINESS_TYPES.INCORPORATED_NONPROFIT },
  { name: 'Government Entity', value: BUSINESS_TYPES.GOVERNMENT_ENTITY },
];

/**
 * Representative Responsibility Types
 */
export const REPRESENTATIVE_RESPONSIBILITIES = {
  CONTROLLER: 'controller',
  OWNER: 'owner',
} as const;

export type RepresentativeResponsibility =
  (typeof REPRESENTATIVE_RESPONSIBILITIES)[keyof typeof REPRESENTATIVE_RESPONSIBILITIES];

export const REPRESENTATIVE_RESPONSIBILITY_OPTIONS = [
  {
    name: 'Controller',
    value: REPRESENTATIVE_RESPONSIBILITIES.CONTROLLER,
    description: 'Person who manages the business account',
  },
  {
    name: 'Owner',
    value: REPRESENTATIVE_RESPONSIBILITIES.OWNER,
    description: 'Person who owns 25% or more of the business',
  },
];

/**
 * Dispute Status
 */
export const DISPUTE_STATUS = {
  RESPONSE_NEEDED: 'response-needed',
  UNDER_REVIEW: 'under-review',
  WON: 'won',
  LOST: 'lost',
  CLOSED: 'closed',
  ACCEPTED: 'accepted',
} as const;

export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

export const DISPUTE_STATUS_OPTIONS = [
  { name: 'Response Needed', value: DISPUTE_STATUS.RESPONSE_NEEDED },
  { name: 'Under Review', value: DISPUTE_STATUS.UNDER_REVIEW },
  { name: 'Won', value: DISPUTE_STATUS.WON },
  { name: 'Lost', value: DISPUTE_STATUS.LOST },
  { name: 'Closed', value: DISPUTE_STATUS.CLOSED },
  { name: 'Accepted', value: DISPUTE_STATUS.ACCEPTED },
];

/**
 * Underwriting Status
 */
export const UNDERWRITING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVIEW_REQUIRED: 'review-required',
  IN_PROGRESS: 'in-progress',
} as const;

export type UnderwritingStatus = (typeof UNDERWRITING_STATUS)[keyof typeof UNDERWRITING_STATUS];

export const UNDERWRITING_STATUS_OPTIONS = [
  { name: 'Pending', value: UNDERWRITING_STATUS.PENDING },
  { name: 'Approved', value: UNDERWRITING_STATUS.APPROVED },
  { name: 'Rejected', value: UNDERWRITING_STATUS.REJECTED },
  { name: 'Review Required', value: UNDERWRITING_STATUS.REVIEW_REQUIRED },
  { name: 'In Progress', value: UNDERWRITING_STATUS.IN_PROGRESS },
];

/**
 * Schedule Frequency
 */
export const SCHEDULE_FREQUENCY = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'bi-weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
} as const;

export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCY)[keyof typeof SCHEDULE_FREQUENCY];

export const SCHEDULE_FREQUENCY_OPTIONS = [
  { name: 'Once', value: SCHEDULE_FREQUENCY.ONCE },
  { name: 'Daily', value: SCHEDULE_FREQUENCY.DAILY },
  { name: 'Weekly', value: SCHEDULE_FREQUENCY.WEEKLY },
  { name: 'Bi-Weekly', value: SCHEDULE_FREQUENCY.BIWEEKLY },
  { name: 'Monthly', value: SCHEDULE_FREQUENCY.MONTHLY },
  { name: 'Quarterly', value: SCHEDULE_FREQUENCY.QUARTERLY },
  { name: 'Yearly', value: SCHEDULE_FREQUENCY.YEARLY },
];

/**
 * Verification Methods
 */
export const VERIFICATION_METHODS = {
  MICRO_DEPOSITS: 'micro-deposits',
  INSTANT: 'instant',
  PLAID: 'plaid',
  MX: 'mx',
} as const;

export type VerificationMethod = (typeof VERIFICATION_METHODS)[keyof typeof VERIFICATION_METHODS];

export const VERIFICATION_METHOD_OPTIONS = [
  {
    name: 'Micro Deposits',
    value: VERIFICATION_METHODS.MICRO_DEPOSITS,
    description: 'Verify via small deposits (takes 1-3 business days)',
  },
  {
    name: 'Instant',
    value: VERIFICATION_METHODS.INSTANT,
    description: 'Instant verification via banking connection',
  },
  {
    name: 'Plaid',
    value: VERIFICATION_METHODS.PLAID,
    description: 'Verify via Plaid connection',
  },
  {
    name: 'MX',
    value: VERIFICATION_METHODS.MX,
    description: 'Verify via MX connection',
  },
];

/**
 * Document Types
 */
export const DOCUMENT_TYPES = {
  EIN_LETTER: 'EIN-letter',
  BUSINESS_LICENSE: 'business-license',
  CERTIFICATE_OF_INCORPORATION: 'certificate-of-incorporation',
  ARTICLES_OF_ORGANIZATION: 'articles-of-organization',
  BANK_STATEMENT: 'bank-statement',
  DRIVERS_LICENSE: 'drivers-license',
  PASSPORT: 'passport',
  SSN_CARD: 'ssn-card',
  UTILITY_BILL: 'utility-bill',
  VOIDED_CHECK: 'voided-check',
  OTHER: 'other',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

export const DOCUMENT_TYPE_OPTIONS = [
  { name: 'EIN Letter', value: DOCUMENT_TYPES.EIN_LETTER },
  { name: 'Business License', value: DOCUMENT_TYPES.BUSINESS_LICENSE },
  { name: 'Certificate of Incorporation', value: DOCUMENT_TYPES.CERTIFICATE_OF_INCORPORATION },
  { name: 'Articles of Organization', value: DOCUMENT_TYPES.ARTICLES_OF_ORGANIZATION },
  { name: 'Bank Statement', value: DOCUMENT_TYPES.BANK_STATEMENT },
  { name: 'Drivers License', value: DOCUMENT_TYPES.DRIVERS_LICENSE },
  { name: 'Passport', value: DOCUMENT_TYPES.PASSPORT },
  { name: 'SSN Card', value: DOCUMENT_TYPES.SSN_CARD },
  { name: 'Utility Bill', value: DOCUMENT_TYPES.UTILITY_BILL },
  { name: 'Voided Check', value: DOCUMENT_TYPES.VOIDED_CHECK },
  { name: 'Other', value: DOCUMENT_TYPES.OTHER },
];

/**
 * Currency Codes (ISO 4217)
 */
export const CURRENCY_CODES = {
  USD: 'USD',
  CAD: 'CAD',
  EUR: 'EUR',
  GBP: 'GBP',
} as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[keyof typeof CURRENCY_CODES];

export const CURRENCY_OPTIONS = [
  { name: 'US Dollar (USD)', value: CURRENCY_CODES.USD },
  { name: 'Canadian Dollar (CAD)', value: CURRENCY_CODES.CAD },
  { name: 'Euro (EUR)', value: CURRENCY_CODES.EUR },
  { name: 'British Pound (GBP)', value: CURRENCY_CODES.GBP },
];

/**
 * Moov Error Codes
 */
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'invalid-credentials',
  EXPIRED_TOKEN: 'expired-token',
  INSUFFICIENT_SCOPE: 'insufficient-scope',

  // Account
  ACCOUNT_NOT_FOUND: 'account-not-found',
  ACCOUNT_DISABLED: 'account-disabled',
  DUPLICATE_ACCOUNT: 'duplicate-account',

  // Transfer
  INSUFFICIENT_FUNDS: 'insufficient-funds',
  TRANSFER_LIMIT_EXCEEDED: 'transfer-limit-exceeded',
  INVALID_PAYMENT_METHOD: 'invalid-payment-method',
  TRANSFER_NOT_FOUND: 'transfer-not-found',

  // Bank Account
  BANK_ACCOUNT_NOT_FOUND: 'bank-account-not-found',
  BANK_ACCOUNT_NOT_VERIFIED: 'bank-account-not-verified',
  INVALID_ROUTING_NUMBER: 'invalid-routing-number',
  INVALID_ACCOUNT_NUMBER: 'invalid-account-number',

  // Card
  CARD_NOT_FOUND: 'card-not-found',
  CARD_DECLINED: 'card-declined',
  CARD_EXPIRED: 'card-expired',

  // General
  VALIDATION_ERROR: 'validation-error',
  RATE_LIMITED: 'rate-limited',
  INTERNAL_ERROR: 'internal-error',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
