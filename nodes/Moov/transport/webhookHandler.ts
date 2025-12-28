/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IWebhookFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  MOOV_SIGNATURE_HEADER,
  MOOV_WEBHOOK_ID_HEADER,
  type MoovWebhookEvent,
} from '../utils/signatureUtils';
import { EVENT_TYPES, type EventType } from '../constants/eventTypes';

/**
 * Webhook Handler for Moov Events
 *
 * Processes incoming webhook events from Moov.
 */

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  events: EventType[];
  verifySignature: boolean;
  includeRawPayload: boolean;
}

/**
 * Processed webhook event
 */
export interface ProcessedWebhookEvent {
  eventId: string;
  type: EventType;
  data: IDataObject;
  timestamp: string;
  accountId?: string;
  webhookId?: string;
  rawPayload?: string;
  verified: boolean;
}

/**
 * Get webhook secret from credentials
 */
export async function getWebhookSecret(
  context: IWebhookFunctions,
): Promise<string | undefined> {
  const credentials = await context.getCredentials('moovApi');
  return credentials.webhookSecret as string | undefined;
}

/**
 * Process incoming webhook request
 */
export async function processWebhook(
  context: IWebhookFunctions,
  config: WebhookConfig,
): Promise<INodeExecutionData[] | null> {
  const req = context.getRequestObject();
  const headers = context.getHeaderData();

  // Get raw body
  const rawBody =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // Verify signature if enabled
  let verified = false;
  if (config.verifySignature) {
    const webhookSecret = await getWebhookSecret(context);
    if (webhookSecret) {
      const signatureHeader = headers[MOOV_SIGNATURE_HEADER] as string;
      const webhookId = headers[MOOV_WEBHOOK_ID_HEADER] as string;

      const result = verifyWebhookSignature(rawBody, signatureHeader, webhookSecret, webhookId);
      verified = result.isValid;

      if (!verified) {
        // Log but don't fail - allow processing with warning
        console.warn(`Webhook signature verification failed: ${result.error}`);
      }
    } else {
      console.warn('Webhook secret not configured, skipping signature verification');
      verified = true; // Consider verified if no secret is set
    }
  } else {
    verified = true;
  }

  // Parse event
  const event = parseWebhookEvent(rawBody);
  if (!event) {
    console.error('Failed to parse webhook event');
    return null;
  }

  // Check if event type matches configured events
  if (config.events.length > 0 && !config.events.includes(event.type as EventType)) {
    // Event type not in filter, ignore
    return null;
  }

  // Build processed event
  const processedEvent: ProcessedWebhookEvent = {
    eventId: event.eventID,
    type: event.type as EventType,
    data: event.data as IDataObject,
    timestamp: event.createdOn,
    accountId: event.accountID,
    webhookId: event.webhookID,
    verified,
  };

  if (config.includeRawPayload) {
    processedEvent.rawPayload = rawBody;
  }

  return [
    {
      json: processedEvent as unknown as IDataObject,
    },
  ];
}

/**
 * Get event category from event type
 */
export function getEventCategory(eventType: EventType): string {
  return eventType.split('.')[0];
}

/**
 * Check if event matches a pattern (supports wildcards)
 */
export function eventMatchesPattern(eventType: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }

  if (pattern.endsWith('.*')) {
    const category = pattern.slice(0, -2);
    return eventType.startsWith(category + '.');
  }

  return eventType === pattern;
}

/**
 * Filter events by patterns
 */
export function filterEventsByPatterns(
  events: MoovWebhookEvent[],
  patterns: string[],
): MoovWebhookEvent[] {
  if (patterns.length === 0 || patterns.includes('*')) {
    return events;
  }

  return events.filter((event) =>
    patterns.some((pattern) => eventMatchesPattern(event.type, pattern)),
  );
}

/**
 * Build webhook registration payload
 */
export function buildWebhookRegistration(
  url: string,
  events: EventType[],
  secret?: string,
): Record<string, unknown> {
  const registration: Record<string, unknown> = {
    url,
    events,
  };

  if (secret) {
    registration.secret = secret;
  }

  return registration;
}

/**
 * Event type groups for UI
 */
export const EVENT_TYPE_GROUPS = {
  account: {
    label: 'Account Events',
    events: [
      EVENT_TYPES.ACCOUNT_CREATED,
      EVENT_TYPES.ACCOUNT_UPDATED,
      EVENT_TYPES.ACCOUNT_DELETED,
    ],
  },
  capability: {
    label: 'Capability Events',
    events: [
      EVENT_TYPES.CAPABILITY_REQUESTED,
      EVENT_TYPES.CAPABILITY_UPDATED,
      EVENT_TYPES.CAPABILITY_DISABLED,
    ],
  },
  bankAccount: {
    label: 'Bank Account Events',
    events: [
      EVENT_TYPES.BANK_ACCOUNT_CREATED,
      EVENT_TYPES.BANK_ACCOUNT_UPDATED,
      EVENT_TYPES.BANK_ACCOUNT_DELETED,
      EVENT_TYPES.BANK_ACCOUNT_VERIFIED,
      EVENT_TYPES.BANK_ACCOUNT_VERIFICATION_FAILED,
      EVENT_TYPES.MICRO_DEPOSITS_INITIATED,
      EVENT_TYPES.MICRO_DEPOSITS_COMPLETED,
    ],
  },
  card: {
    label: 'Card Events',
    events: [
      EVENT_TYPES.CARD_CREATED,
      EVENT_TYPES.CARD_UPDATED,
      EVENT_TYPES.CARD_DELETED,
      EVENT_TYPES.CARD_EXPIRED,
    ],
  },
  transfer: {
    label: 'Transfer Events',
    events: [
      EVENT_TYPES.TRANSFER_CREATED,
      EVENT_TYPES.TRANSFER_UPDATED,
      EVENT_TYPES.TRANSFER_COMPLETED,
      EVENT_TYPES.TRANSFER_FAILED,
      EVENT_TYPES.TRANSFER_CANCELED,
      EVENT_TYPES.TRANSFER_REVERSED,
      EVENT_TYPES.TRANSFER_REFUNDED,
      EVENT_TYPES.TRANSFER_PENDING,
      EVENT_TYPES.TRANSFER_QUEUED,
    ],
  },
  refund: {
    label: 'Refund Events',
    events: [
      EVENT_TYPES.REFUND_CREATED,
      EVENT_TYPES.REFUND_UPDATED,
      EVENT_TYPES.REFUND_COMPLETED,
      EVENT_TYPES.REFUND_FAILED,
    ],
  },
  dispute: {
    label: 'Dispute Events',
    events: [
      EVENT_TYPES.DISPUTE_CREATED,
      EVENT_TYPES.DISPUTE_UPDATED,
      EVENT_TYPES.DISPUTE_WON,
      EVENT_TYPES.DISPUTE_LOST,
      EVENT_TYPES.DISPUTE_EVIDENCE_REQUIRED,
    ],
  },
  wallet: {
    label: 'Wallet Events',
    events: [EVENT_TYPES.WALLET_UPDATED, EVENT_TYPES.WALLET_BALANCE_CHANGED],
  },
  verification: {
    label: 'Verification Events',
    events: [
      EVENT_TYPES.VERIFICATION_STARTED,
      EVENT_TYPES.VERIFICATION_COMPLETED,
      EVENT_TYPES.VERIFICATION_FAILED,
    ],
  },
  underwriting: {
    label: 'Underwriting Events',
    events: [
      EVENT_TYPES.UNDERWRITING_PENDING,
      EVENT_TYPES.UNDERWRITING_APPROVED,
      EVENT_TYPES.UNDERWRITING_REJECTED,
      EVENT_TYPES.UNDERWRITING_REVIEW_REQUIRED,
    ],
  },
  schedule: {
    label: 'Schedule Events',
    events: [
      EVENT_TYPES.SCHEDULE_CREATED,
      EVENT_TYPES.SCHEDULE_UPDATED,
      EVENT_TYPES.SCHEDULE_CANCELED,
      EVENT_TYPES.SCHEDULE_OCCURRENCE_EXECUTED,
      EVENT_TYPES.SCHEDULE_OCCURRENCE_FAILED,
    ],
  },
};

/**
 * Get all event types as flat array
 */
export function getAllEventTypes(): EventType[] {
  return Object.values(EVENT_TYPES);
}

/**
 * Get event types by group
 */
export function getEventTypesByGroup(
  group: keyof typeof EVENT_TYPE_GROUPS,
): EventType[] {
  return EVENT_TYPE_GROUPS[group]?.events || [];
}
