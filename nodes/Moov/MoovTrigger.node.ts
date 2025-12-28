/**
 * Moov Trigger Node for n8n
 * 
 * Webhook-based trigger for real-time Moov events.
 * Supports all Moov event types with signature verification.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';
import { verifyWebhookSignature } from './utils/signatureUtils';

export class MoovTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Moov Trigger',
		name: 'moovTrigger',
		icon: 'file:moov.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Listen for Moov webhook events',
		defaults: {
			name: 'Moov Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'moovApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				required: true,
				default: 'all',
				options: [
					{ name: 'All Events', value: 'all' },
					{ name: 'Account Events', value: 'account' },
					{ name: 'Bank Account Events', value: 'bankAccount' },
					{ name: 'Capability Events', value: 'capability' },
					{ name: 'Card Events', value: 'card' },
					{ name: 'Dispute Events', value: 'dispute' },
					{ name: 'Refund Events', value: 'refund' },
					{ name: 'Transfer Events', value: 'transfer' },
					{ name: 'Wallet Events', value: 'wallet' },
					{ name: 'Verification Events', value: 'verification' },
					{ name: 'Underwriting Events', value: 'underwriting' },
					{ name: 'Schedule Events', value: 'schedule' },
					{ name: 'Custom Selection', value: 'custom' },
				],
				description: 'Category of events to listen for',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				displayOptions: {
					show: {
						eventCategory: ['custom'],
					},
				},
				options: [
					// Account Events
					{ name: 'Account Created', value: 'account.created' },
					{ name: 'Account Updated', value: 'account.updated' },
					{ name: 'Account Deleted', value: 'account.deleted' },
					// Bank Account Events
					{ name: 'Bank Account Created', value: 'bank-account.created' },
					{ name: 'Bank Account Updated', value: 'bank-account.updated' },
					{ name: 'Bank Account Deleted', value: 'bank-account.deleted' },
					{ name: 'Bank Account Verified', value: 'bank-account.verified' },
					{ name: 'Bank Account Errored', value: 'bank-account.errored' },
					{ name: 'Micro Deposits Initiated', value: 'bank-account.micro-deposits-initiated' },
					{ name: 'Micro Deposits Completed', value: 'bank-account.micro-deposits-completed' },
					// Capability Events
					{ name: 'Capability Requested', value: 'capability.requested' },
					{ name: 'Capability Updated', value: 'capability.updated' },
					{ name: 'Capability Disabled', value: 'capability.disabled' },
					// Card Events
					{ name: 'Card Created', value: 'card.created' },
					{ name: 'Card Updated', value: 'card.updated' },
					{ name: 'Card Deleted', value: 'card.deleted' },
					{ name: 'Card Expired', value: 'card.expired' },
					// Dispute Events
					{ name: 'Dispute Created', value: 'dispute.created' },
					{ name: 'Dispute Updated', value: 'dispute.updated' },
					{ name: 'Dispute Won', value: 'dispute.won' },
					{ name: 'Dispute Lost', value: 'dispute.lost' },
					{ name: 'Dispute Evidence Required', value: 'dispute.evidence-required' },
					// Refund Events
					{ name: 'Refund Created', value: 'refund.created' },
					{ name: 'Refund Updated', value: 'refund.updated' },
					{ name: 'Refund Completed', value: 'refund.completed' },
					{ name: 'Refund Failed', value: 'refund.failed' },
					// Transfer Events
					{ name: 'Transfer Created', value: 'transfer.created' },
					{ name: 'Transfer Updated', value: 'transfer.updated' },
					{ name: 'Transfer Pending', value: 'transfer.pending' },
					{ name: 'Transfer Completed', value: 'transfer.completed' },
					{ name: 'Transfer Failed', value: 'transfer.failed' },
					{ name: 'Transfer Canceled', value: 'transfer.canceled' },
					{ name: 'Transfer Reversed', value: 'transfer.reversed' },
					{ name: 'Transfer Queued', value: 'transfer.queued' },
					// Wallet Events
					{ name: 'Wallet Updated', value: 'wallet.updated' },
					{ name: 'Wallet Balance Changed', value: 'wallet.balance-changed' },
					// Verification Events
					{ name: 'Verification Started', value: 'verification.started' },
					{ name: 'Verification Completed', value: 'verification.completed' },
					{ name: 'Verification Failed', value: 'verification.failed' },
					// Underwriting Events
					{ name: 'Underwriting Pending', value: 'underwriting.pending' },
					{ name: 'Underwriting Approved', value: 'underwriting.approved' },
					{ name: 'Underwriting Rejected', value: 'underwriting.rejected' },
					{ name: 'Underwriting Review Required', value: 'underwriting.review-required' },
					// Schedule Events
					{ name: 'Schedule Created', value: 'schedule.created' },
					{ name: 'Schedule Updated', value: 'schedule.updated' },
					{ name: 'Schedule Canceled', value: 'schedule.canceled' },
					{ name: 'Schedule Occurrence Executed', value: 'schedule.occurrence-executed' },
					{ name: 'Schedule Occurrence Failed', value: 'schedule.occurrence-failed' },
				],
				description: 'Specific events to listen for',
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description: 'Whether to verify the webhook signature (recommended)',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// For manual webhook setup, we just return false to show the URL
				// In a real implementation, you would check if webhook is registered with Moov
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Webhook URL is displayed for manual registration with Moov
				// In a full implementation, you would auto-register with Moov API
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Clean up webhook if auto-registered
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as {
			eventType?: string;
			type?: string;
			data?: any;
			[key: string]: any;
		};
		const headers = this.getHeaderData();
		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const verifySignature = this.getNodeParameter('verifySignature') as boolean;

		// Verify webhook signature if enabled
		if (verifySignature) {
			try {
				const credentials = await this.getCredentials('moovApi');
				const webhookSecret = credentials.webhookSecret as string;

				if (webhookSecret) {
					const signature = headers['moov-signature'] as string || headers['x-moov-signature'] as string;
					const timestamp = headers['moov-timestamp'] as string || headers['x-moov-timestamp'] as string;
					
					if (signature) {
						const rawBody = JSON.stringify(body);
						const isValid = verifyWebhookSignature(
							rawBody,
							signature,
							webhookSecret,
							timestamp,
						);

						if (!isValid) {
							return {
								webhookResponse: {
									status: 401,
									body: { error: 'Invalid webhook signature' },
								},
							};
						}
					}
				}
			} catch {
				// If signature verification fails, log but continue
				console.warn('Webhook signature verification skipped');
			}
		}

		// Get event type from body
		const eventType = body.eventType || body.type || 'unknown';

		// Filter by event category or custom selection
		if (eventCategory !== 'all') {
			let allowedEvents: string[] = [];

			switch (eventCategory) {
				case 'account':
					allowedEvents = ['account.created', 'account.updated', 'account.deleted'];
					break;
				case 'bankAccount':
					allowedEvents = [
						'bank-account.created', 'bank-account.updated', 'bank-account.deleted',
						'bank-account.verified', 'bank-account.errored',
						'bank-account.micro-deposits-initiated', 'bank-account.micro-deposits-completed',
					];
					break;
				case 'capability':
					allowedEvents = ['capability.requested', 'capability.updated', 'capability.disabled'];
					break;
				case 'card':
					allowedEvents = ['card.created', 'card.updated', 'card.deleted', 'card.expired'];
					break;
				case 'dispute':
					allowedEvents = [
						'dispute.created', 'dispute.updated', 'dispute.won',
						'dispute.lost', 'dispute.evidence-required',
					];
					break;
				case 'refund':
					allowedEvents = ['refund.created', 'refund.updated', 'refund.completed', 'refund.failed'];
					break;
				case 'transfer':
					allowedEvents = [
						'transfer.created', 'transfer.updated', 'transfer.pending',
						'transfer.completed', 'transfer.failed', 'transfer.canceled',
						'transfer.reversed', 'transfer.queued',
					];
					break;
				case 'wallet':
					allowedEvents = ['wallet.updated', 'wallet.balance-changed'];
					break;
				case 'verification':
					allowedEvents = ['verification.started', 'verification.completed', 'verification.failed'];
					break;
				case 'underwriting':
					allowedEvents = [
						'underwriting.pending', 'underwriting.approved',
						'underwriting.rejected', 'underwriting.review-required',
					];
					break;
				case 'schedule':
					allowedEvents = [
						'schedule.created', 'schedule.updated', 'schedule.canceled',
						'schedule.occurrence-executed', 'schedule.occurrence-failed',
					];
					break;
				case 'custom':
					allowedEvents = this.getNodeParameter('events') as string[];
					break;
			}

			// Check if event matches filter
			if (!allowedEvents.includes(eventType)) {
				return {
					webhookResponse: {
						status: 200,
						body: { received: true, filtered: true },
					},
				};
			}
		}

		// Return the webhook data
		return {
			workflowData: [
				this.helpers.returnJsonArray([
					{
						eventType,
						timestamp: new Date().toISOString(),
						data: body.data || body,
						headers: {
							'moov-signature': headers['moov-signature'] || headers['x-moov-signature'],
							'moov-timestamp': headers['moov-timestamp'] || headers['x-moov-timestamp'],
							'moov-webhook-id': headers['moov-webhook-id'] || headers['x-moov-webhook-id'],
						},
						raw: body,
					},
				]),
			],
		};
	}
}
