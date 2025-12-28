/**
 * Moov Transfer Resource Operations
 * 
 * Transfers move money between accounts. Supports multiple transfer types:
 * ACH, card, RTP, wallet, and wire transfers.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';
import { TRANSFER_STATUSES } from '../../constants/transferTypes';

export const transferOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transfer'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a pending transfer',
				action: 'Cancel a transfer',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new transfer',
				action: 'Create a transfer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific transfer',
				action: 'Get a transfer',
			},
			{
				name: 'Get Options',
				value: 'getOptions',
				description: 'Get available transfer options between accounts',
				action: 'Get transfer options',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List transfers',
				action: 'List transfers',
			},
			{
				name: 'Refund',
				value: 'refund',
				description: 'Refund a completed transfer',
				action: 'Refund a transfer',
			},
			{
				name: 'Reverse',
				value: 'reverse',
				description: 'Reverse a transfer (for ACH)',
				action: 'Reverse a transfer',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update transfer metadata',
				action: 'Update a transfer',
			},
		],
		default: 'list',
	},
];

export const transferFields: INodeProperties[] = [
	// Transfer ID - for get, cancel, refund, reverse, update
	{
		displayName: 'Transfer ID',
		name: 'transferId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the transfer',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['get', 'cancel', 'refund', 'reverse', 'update'],
			},
		},
	},
	// Source Account ID
	{
		displayName: 'Source Account ID',
		name: 'sourceAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The account sending funds',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create', 'getOptions'],
			},
		},
	},
	// Destination Account ID
	{
		displayName: 'Destination Account ID',
		name: 'destinationAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The account receiving funds',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create', 'getOptions'],
			},
		},
	},
	// Amount for create
	{
		displayName: 'Amount (Cents)',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Transfer amount in cents (e.g., 1000 = $10.00)',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create'],
			},
		},
	},
	// Currency
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		required: true,
		default: 'USD',
		description: 'Three-letter currency code (ISO 4217)',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create'],
			},
		},
	},
	// Source Payment Method ID
	{
		displayName: 'Source Payment Method ID',
		name: 'sourcePaymentMethodId',
		type: 'string',
		required: true,
		default: '',
		description: 'The payment method to debit from source account',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create'],
			},
		},
	},
	// Destination Payment Method ID
	{
		displayName: 'Destination Payment Method ID',
		name: 'destinationPaymentMethodId',
		type: 'string',
		required: true,
		default: '',
		description: 'The payment method to credit to destination account',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create'],
			},
		},
	},
	// Refund amount
	{
		displayName: 'Refund Amount (Cents)',
		name: 'refundAmount',
		type: 'number',
		default: 0,
		description: 'Partial refund amount in cents (leave 0 for full refund)',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['refund'],
			},
		},
	},
	// List filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'Filter by account ID (source or destination)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'Canceled', value: 'canceled' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Created', value: 'created' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Reversed', value: 'reversed' },
				],
				description: 'Filter by transfer status',
			},
			{
				displayName: 'Start Date',
				name: 'startDateTime',
				type: 'dateTime',
				default: '',
				description: 'Filter transfers created on or after this date',
			},
			{
				displayName: 'End Date',
				name: 'endDateTime',
				type: 'dateTime',
				default: '',
				description: 'Filter transfers created on or before this date',
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				description: 'Filter by transfer group ID',
			},
			{
				displayName: 'Limit',
				name: 'count',
				type: 'number',
				default: 50,
				description: 'Maximum number of transfers to return',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of transfers to skip',
			},
		],
	},
	// Additional options for create
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the transfer',
			},
			{
				displayName: 'Facilitator Fee (Cents)',
				name: 'facilitatorFee',
				type: 'number',
				default: 0,
				description: 'Fee amount collected by the facilitator in cents',
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'json',
				default: '{}',
				description: 'Custom metadata for the transfer (JSON object)',
			},
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description: 'Unique key to prevent duplicate transfers',
			},
		],
	},
	// Update metadata
	{
		displayName: 'Metadata',
		name: 'metadata',
		type: 'json',
		default: '{}',
		description: 'Updated metadata for the transfer (JSON object)',
		displayOptions: {
			show: {
				resource: ['transfer'],
				operation: ['update'],
			},
		},
	},
];

export async function executeTransferOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			const filters = this.getNodeParameter('filters', index) as any;
			
			const queryParams: Record<string, string> = {};
			
			if (filters.accountId) queryParams.accountID = filters.accountId;
			if (filters.status && filters.status.length > 0) {
				queryParams.status = filters.status.join(',');
			}
			if (filters.startDateTime) queryParams.startDateTime = filters.startDateTime;
			if (filters.endDateTime) queryParams.endDateTime = filters.endDateTime;
			if (filters.groupId) queryParams.groupID = filters.groupId;
			if (filters.count) queryParams.count = String(filters.count);
			if (filters.skip) queryParams.skip = String(filters.skip);

			const queryString = Object.keys(queryParams).length > 0
				? '?' + new URLSearchParams(queryParams).toString()
				: '';

			responseData = await client.get(`/transfers${queryString}`);
			break;
		}

		case 'get': {
			const transferId = this.getNodeParameter('transferId', index) as string;
			responseData = await client.get(`/transfers/${transferId}`);
			break;
		}

		case 'create': {
			const sourceAccountId = this.getNodeParameter('sourceAccountId', index) as string;
			const destinationAccountId = this.getNodeParameter('destinationAccountId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const currency = this.getNodeParameter('currency', index) as string;
			const sourcePaymentMethodId = this.getNodeParameter('sourcePaymentMethodId', index) as string;
			const destinationPaymentMethodId = this.getNodeParameter('destinationPaymentMethodId', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index) as any;

			const body: any = {
				source: {
					accountID: sourceAccountId,
					paymentMethodID: sourcePaymentMethodId,
				},
				destination: {
					accountID: destinationAccountId,
					paymentMethodID: destinationPaymentMethodId,
				},
				amount: {
					value: amount,
					currency,
				},
			};

			if (additionalOptions.description) {
				body.description = additionalOptions.description;
			}
			if (additionalOptions.facilitatorFee) {
				body.facilitatorFee = {
					total: additionalOptions.facilitatorFee,
					markup: 0,
				};
			}
			if (additionalOptions.metadata) {
				try {
					body.metadata = JSON.parse(additionalOptions.metadata);
				} catch (e) {
					throw new NodeOperationError(this.getNode(), 'Invalid metadata JSON');
				}
			}

			const headers: Record<string, string> = {};
			if (additionalOptions.idempotencyKey) {
				headers['X-Idempotency-Key'] = additionalOptions.idempotencyKey;
			}

			responseData = await client.post('/transfers', body, headers);
			break;
		}

		case 'getOptions': {
			const sourceAccountId = this.getNodeParameter('sourceAccountId', index) as string;
			const destinationAccountId = this.getNodeParameter('destinationAccountId', index) as string;

			responseData = await client.get(
				`/transfer-options?source.accountID=${sourceAccountId}&destination.accountID=${destinationAccountId}`
			);
			break;
		}

		case 'cancel': {
			const transferId = this.getNodeParameter('transferId', index) as string;
			responseData = await client.post(`/transfers/${transferId}/cancel`, {});
			break;
		}

		case 'refund': {
			const transferId = this.getNodeParameter('transferId', index) as string;
			const refundAmount = this.getNodeParameter('refundAmount', index) as number;

			const body: any = {};
			if (refundAmount > 0) {
				body.amount = refundAmount;
			}

			responseData = await client.post(`/transfers/${transferId}/refunds`, body);
			break;
		}

		case 'reverse': {
			const transferId = this.getNodeParameter('transferId', index) as string;
			responseData = await client.post(`/transfers/${transferId}/reversals`, {});
			break;
		}

		case 'update': {
			const transferId = this.getNodeParameter('transferId', index) as string;
			const metadata = this.getNodeParameter('metadata', index) as string;

			let parsedMetadata: any;
			try {
				parsedMetadata = JSON.parse(metadata);
			} catch (e) {
				throw new NodeOperationError(this.getNode(), 'Invalid metadata JSON');
			}

			responseData = await client.patch(`/transfers/${transferId}`, { metadata: parsedMetadata });
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
