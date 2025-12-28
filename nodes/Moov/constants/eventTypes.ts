/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Moov Event Types
 *
 * Webhook events that can be received from the Moov platform.
 */

export const EVENT_TYPES = {
  // Account Events
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_DELETED: 'account.deleted',

  // Capability Events
  CAPABILITY_REQUESTED: 'capability.requested',
  CAPABILITY_UPDATED: 'capability.updated',
  CAPABILITY_DISABLED: 'capability.disabled',

  // Bank Account Events
  BANK_ACCOUNT_CREATED: 'bank-account.created',
  BANK_ACCOUNT_UPDATED: 'bank-account.updated',
  BANK_ACCOUNT_DELETED: 'bank-account.deleted',
  BANK_ACCOUNT_VERIFIED: 'bank-account.verified',
  BANK_ACCOUNT_VERIFICATION_FAILED: 'bank-account.verification-failed',
  MICRO_DEPOSITS_INITIATED: 'micro-deposits.initiated',
  MICRO_DEPOSITS_COMPLETED: 'micro-deposits.completed',

  // Card Events
  CARD_CREATED: 'card.created',
  CARD_UPDATED: 'card.updated',
  CARD_DELETED: 'card.deleted',
  CARD_EXPIRED: 'card.expired',

  // Transfer Events
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_UPDATED: 'transfer.updated',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
  TRANSFER_CANCELED: 'transfer.canceled',
  TRANSFER_REVERSED: 'transfer.reversed',
  TRANSFER_REFUNDED: 'transfer.refunded',
  TRANSFER_PENDING: 'transfer.pending',
  TRANSFER_QUEUED: 'transfer.queued',

  // Refund Events
  REFUND_CREATED: 'refund.created',
  REFUND_UPDATED: 'refund.updated',
  REFUND_COMPLETED: 'refund.completed',
  REFUND_FAILED: 'refund.failed',

  // Dispute Events
  DISPUTE_CREATED: 'dispute.created',
  DISPUTE_UPDATED: 'dispute.updated',
  DISPUTE_WON: 'dispute.won',
  DISPUTE_LOST: 'dispute.lost',
  DISPUTE_EVIDENCE_REQUIRED: 'dispute.evidence-required',

  // Wallet Events
  WALLET_UPDATED: 'wallet.updated',
  WALLET_BALANCE_CHANGED: 'wallet.balance-changed',

  // Verification Events
  VERIFICATION_STARTED: 'verification.started',
  VERIFICATION_COMPLETED: 'verification.completed',
  VERIFICATION_FAILED: 'verification.failed',

  // Underwriting Events
  UNDERWRITING_PENDING: 'underwriting.pending',
  UNDERWRITING_APPROVED: 'underwriting.approved',
  UNDERWRITING_REJECTED: 'underwriting.rejected',
  UNDERWRITING_REVIEW_REQUIRED: 'underwriting.review-required',

  // Schedule Events
  SCHEDULE_CREATED: 'schedule.created',
  SCHEDULE_UPDATED: 'schedule.updated',
  SCHEDULE_CANCELED: 'schedule.canceled',
  SCHEDULE_OCCURRENCE_EXECUTED: 'schedule.occurrence-executed',
  SCHEDULE_OCCURRENCE_FAILED: 'schedule.occurrence-failed',

  // Representative Events
  REPRESENTATIVE_CREATED: 'representative.created',
  REPRESENTATIVE_UPDATED: 'representative.updated',
  REPRESENTATIVE_DELETED: 'representative.deleted',

  // Document Events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_VERIFIED: 'document.verified',
  DOCUMENT_REJECTED: 'document.rejected',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * Event Category Groups
 */
export const EVENT_CATEGORIES = {
  ACCOUNT: 'account',
  CAPABILITY: 'capability',
  BANK_ACCOUNT: 'bank-account',
  CARD: 'card',
  TRANSFER: 'transfer',
  REFUND: 'refund',
  DISPUTE: 'dispute',
  WALLET: 'wallet',
  VERIFICATION: 'verification',
  UNDERWRITING: 'underwriting',
  SCHEDULE: 'schedule',
  REPRESENTATIVE: 'representative',
  DOCUMENT: 'document',
} as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];

/**
 * Event Type Options for n8n Trigger
 */
export const EVENT_TYPE_OPTIONS = [
  // Account Events
  { name: 'Account Created', value: EVENT_TYPES.ACCOUNT_CREATED },
  { name: 'Account Updated', value: EVENT_TYPES.ACCOUNT_UPDATED },
  { name: 'Account Deleted', value: EVENT_TYPES.ACCOUNT_DELETED },

  // Capability Events
  { name: 'Capability Requested', value: EVENT_TYPES.CAPABILITY_REQUESTED },
  { name: 'Capability Updated', value: EVENT_TYPES.CAPABILITY_UPDATED },
  { name: 'Capability Disabled', value: EVENT_TYPES.CAPABILITY_DISABLED },

  // Bank Account Events
  { name: 'Bank Account Created', value: EVENT_TYPES.BANK_ACCOUNT_CREATED },
  { name: 'Bank Account Updated', value: EVENT_TYPES.BANK_ACCOUNT_UPDATED },
  { name: 'Bank Account Deleted', value: EVENT_TYPES.BANK_ACCOUNT_DELETED },
  { name: 'Bank Account Verified', value: EVENT_TYPES.BANK_ACCOUNT_VERIFIED },
  { name: 'Bank Account Verification Failed', value: EVENT_TYPES.BANK_ACCOUNT_VERIFICATION_FAILED },
  { name: 'Micro Deposits Initiated', value: EVENT_TYPES.MICRO_DEPOSITS_INITIATED },
  { name: 'Micro Deposits Completed', value: EVENT_TYPES.MICRO_DEPOSITS_COMPLETED },

  // Card Events
  { name: 'Card Created', value: EVENT_TYPES.CARD_CREATED },
  { name: 'Card Updated', value: EVENT_TYPES.CARD_UPDATED },
  { name: 'Card Deleted', value: EVENT_TYPES.CARD_DELETED },
  { name: 'Card Expired', value: EVENT_TYPES.CARD_EXPIRED },

  // Transfer Events
  { name: 'Transfer Created', value: EVENT_TYPES.TRANSFER_CREATED },
  { name: 'Transfer Updated', value: EVENT_TYPES.TRANSFER_UPDATED },
  { name: 'Transfer Completed', value: EVENT_TYPES.TRANSFER_COMPLETED },
  { name: 'Transfer Failed', value: EVENT_TYPES.TRANSFER_FAILED },
  { name: 'Transfer Canceled', value: EVENT_TYPES.TRANSFER_CANCELED },
  { name: 'Transfer Reversed', value: EVENT_TYPES.TRANSFER_REVERSED },
  { name: 'Transfer Refunded', value: EVENT_TYPES.TRANSFER_REFUNDED },
  { name: 'Transfer Pending', value: EVENT_TYPES.TRANSFER_PENDING },
  { name: 'Transfer Queued', value: EVENT_TYPES.TRANSFER_QUEUED },

  // Refund Events
  { name: 'Refund Created', value: EVENT_TYPES.REFUND_CREATED },
  { name: 'Refund Updated', value: EVENT_TYPES.REFUND_UPDATED },
  { name: 'Refund Completed', value: EVENT_TYPES.REFUND_COMPLETED },
  { name: 'Refund Failed', value: EVENT_TYPES.REFUND_FAILED },

  // Dispute Events
  { name: 'Dispute Created', value: EVENT_TYPES.DISPUTE_CREATED },
  { name: 'Dispute Updated', value: EVENT_TYPES.DISPUTE_UPDATED },
  { name: 'Dispute Won', value: EVENT_TYPES.DISPUTE_WON },
  { name: 'Dispute Lost', value: EVENT_TYPES.DISPUTE_LOST },
  { name: 'Dispute Evidence Required', value: EVENT_TYPES.DISPUTE_EVIDENCE_REQUIRED },

  // Wallet Events
  { name: 'Wallet Updated', value: EVENT_TYPES.WALLET_UPDATED },
  { name: 'Wallet Balance Changed', value: EVENT_TYPES.WALLET_BALANCE_CHANGED },

  // Verification Events
  { name: 'Verification Started', value: EVENT_TYPES.VERIFICATION_STARTED },
  { name: 'Verification Completed', value: EVENT_TYPES.VERIFICATION_COMPLETED },
  { name: 'Verification Failed', value: EVENT_TYPES.VERIFICATION_FAILED },

  // Underwriting Events
  { name: 'Underwriting Pending', value: EVENT_TYPES.UNDERWRITING_PENDING },
  { name: 'Underwriting Approved', value: EVENT_TYPES.UNDERWRITING_APPROVED },
  { name: 'Underwriting Rejected', value: EVENT_TYPES.UNDERWRITING_REJECTED },
  { name: 'Underwriting Review Required', value: EVENT_TYPES.UNDERWRITING_REVIEW_REQUIRED },

  // Schedule Events
  { name: 'Schedule Created', value: EVENT_TYPES.SCHEDULE_CREATED },
  { name: 'Schedule Updated', value: EVENT_TYPES.SCHEDULE_UPDATED },
  { name: 'Schedule Canceled', value: EVENT_TYPES.SCHEDULE_CANCELED },
  { name: 'Schedule Occurrence Executed', value: EVENT_TYPES.SCHEDULE_OCCURRENCE_EXECUTED },
  { name: 'Schedule Occurrence Failed', value: EVENT_TYPES.SCHEDULE_OCCURRENCE_FAILED },

  // Representative Events
  { name: 'Representative Created', value: EVENT_TYPES.REPRESENTATIVE_CREATED },
  { name: 'Representative Updated', value: EVENT_TYPES.REPRESENTATIVE_UPDATED },
  { name: 'Representative Deleted', value: EVENT_TYPES.REPRESENTATIVE_DELETED },

  // Document Events
  { name: 'Document Uploaded', value: EVENT_TYPES.DOCUMENT_UPLOADED },
  { name: 'Document Verified', value: EVENT_TYPES.DOCUMENT_VERIFIED },
  { name: 'Document Rejected', value: EVENT_TYPES.DOCUMENT_REJECTED },
];

/**
 * Get events by category
 */
export function getEventsByCategory(category: EventCategory): EventType[] {
  return Object.values(EVENT_TYPES).filter((event) => event.startsWith(category));
}

/**
 * Get category from event type
 */
export function getCategoryFromEvent(eventType: EventType): EventCategory | undefined {
  const prefix = eventType.split('.')[0];
  return Object.values(EVENT_CATEGORIES).find((cat) => cat === prefix);
}
