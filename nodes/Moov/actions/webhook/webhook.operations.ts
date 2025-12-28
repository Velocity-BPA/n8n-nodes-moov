/**
 * Moov Webhook Resource Operations
 * 
 * Webhooks notify your application of events in real-time.
 * Configure endpoints, manage subscriptions, and handle event delivery.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a webhook subscription',
				action: 'Create webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook subscription',
				action: 'Delete webhook',
			},
			{
				name: 'Disable',
				value: 'disable',
				description: 'Disable a webhook',
				action: 'Disable webhook',
			},
			{
				name: 'Enable',
				value: 'enable',
				description: 'Enable a webhook',
				action: 'Enable webhook',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a webhook subscription',
				action: 'Get webhook',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all webhook subscriptions',
				action: 'List webhooks',
			},
			{
				name: 'List Events',
				value: 'listEvents',
				description: 'List events for a webhook',
				action: 'List webhook events',
			},
			{
				name: 'Ping',
				value: 'ping',
				description: 'Send a test ping to a webhook',
				action: 'Ping webhook',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook subscription',
				action: 'Update webhook',
			},
		],
		default: 'list',
	},
];

export const webhookFields: INodeProperties[] = [
	// Webhook ID - for get, update, delete, ping, listEvents, enable, disable
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the webhook',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['get', 'update', 'delete', 'ping', 'listEvents', 'enable', 'disable'],
			},
		},
	},
	// URL - for create
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://your-app.com/webhook',
		description: 'The URL that will receive webhook events (must be HTTPS)',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	// Event Types - for create and update
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		required: true,
		default: [],
		options: [
			{ name: 'Account Created', value: 'account.created' },
			{ name: 'Account Updated', value: 'account.updated' },
			{ name: 'Account Deleted', value: 'account.deleted' },
			{ name: 'Bank Account Created', value: 'bank-account.created' },
			{ name: 'Bank Account Updated', value: 'bank-account.updated' },
			{ name: 'Bank Account Deleted', value: 'bank-account.deleted' },
			{ name: 'Bank Account Verified', value: 'bank-account.verified' },
			{ name: 'Capability Requested', value: 'capability.requested' },
			{ name: 'Capability Updated', value: 'capability.updated' },
			{ name: 'Card Created', value: 'card.created' },
			{ name: 'Card Updated', value: 'card.updated' },
			{ name: 'Card Deleted', value: 'card.deleted' },
			{ name: 'Dispute Created', value: 'dispute.created' },
			{ name: 'Dispute Updated', value: 'dispute.updated' },
			{ name: 'Refund Created', value: 'refund.created' },
			{ name: 'Refund Updated', value: 'refund.updated' },
			{ name: 'Transfer Created', value: 'transfer.created' },
			{ name: 'Transfer Updated', value: 'transfer.updated' },
			{ name: 'Transfer Completed', value: 'transfer.completed' },
			{ name: 'Transfer Failed', value: 'transfer.failed' },
			{ name: 'Transfer Reversed', value: 'transfer.reversed' },
			{ name: 'Wallet Updated', value: 'wallet.updated' },
		],
		description: 'Events that will trigger this webhook',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	// Webhook Options - for create
	{
		displayName: 'Webhook Options',
		name: 'webhookOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret for signing webhook payloads (auto-generated if not provided)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the webhook',
			},
		],
	},
	// Update Fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'New webhook URL',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'Account Created', value: 'account.created' },
					{ name: 'Account Updated', value: 'account.updated' },
					{ name: 'Transfer Created', value: 'transfer.created' },
					{ name: 'Transfer Updated', value: 'transfer.updated' },
					{ name: 'Transfer Completed', value: 'transfer.completed' },
				],
				description: 'Events that will trigger this webhook',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description',
			},
		],
	},
];

export async function executeWebhookOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get('/webhooks');
			break;
		}

		case 'get': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			responseData = await client.get(`/webhooks/${webhookId}`);
			break;
		}

		case 'create': {
			const url = this.getNodeParameter('url', index) as string;
			const eventTypes = this.getNodeParameter('eventTypes', index) as string[];
			const webhookOptions = this.getNodeParameter('webhookOptions', index, {}) as any;

			const body: any = {
				url,
				eventTypes,
			};

			if (webhookOptions.secret) body.secret = webhookOptions.secret;
			if (webhookOptions.description) body.description = webhookOptions.description;

			responseData = await client.post('/webhooks', body);
			break;
		}

		case 'update': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;

			const body: any = {};
			if (updateFields.url) body.url = updateFields.url;
			if (updateFields.eventTypes?.length) body.eventTypes = updateFields.eventTypes;
			if (updateFields.description) body.description = updateFields.description;

			responseData = await client.patch(`/webhooks/${webhookId}`, body);
			break;
		}

		case 'delete': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			responseData = await client.delete(`/webhooks/${webhookId}`);
			break;
		}

		case 'ping': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			responseData = await client.post(`/webhooks/${webhookId}/ping`, {});
			break;
		}

		case 'listEvents': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			responseData = await client.get(`/webhooks/${webhookId}/events`);
			break;
		}

		case 'enable': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			responseData = await client.post(`/webhooks/${webhookId}/enable`, {});
			break;
		}

		case 'disable': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			responseData = await client.post(`/webhooks/${webhookId}/disable`, {});
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
