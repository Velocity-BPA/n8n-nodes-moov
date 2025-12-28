/**
 * Moov Refund Resource Operations
 * 
 * Refunds allow returning funds from a completed transfer back to the original source.
 * Refunds can be full or partial and are subject to the original transfer's payment method.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const refundOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['refund'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a refund for a transfer',
				action: 'Create a refund',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific refund',
				action: 'Get a refund',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all refunds for a transfer',
				action: 'List refunds',
			},
		],
		default: 'list',
	},
];

export const refundFields: INodeProperties[] = [
	// Account ID
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the Moov account',
		displayOptions: {
			show: {
				resource: ['refund'],
			},
		},
	},
	// Transfer ID
	{
		displayName: 'Transfer ID',
		name: 'transferId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the transfer to refund',
		displayOptions: {
			show: {
				resource: ['refund'],
			},
		},
	},
	// Refund ID - for get
	{
		displayName: 'Refund ID',
		name: 'refundId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the refund',
		displayOptions: {
			show: {
				resource: ['refund'],
				operation: ['get'],
			},
		},
	},
	// Amount - for create (optional for partial refund)
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		default: 0,
		description: 'The amount to refund in cents. Leave empty for full refund.',
		displayOptions: {
			show: {
				resource: ['refund'],
				operation: ['create'],
			},
		},
	},
	// Additional Options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['refund'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description: 'Unique key to prevent duplicate refunds',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the refund',
			},
		],
	},
];

export async function executeRefundOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;
	const transferId = this.getNodeParameter('transferId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'create': {
			const amount = this.getNodeParameter('amount', index) as number;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as {
				idempotencyKey?: string;
				description?: string;
			};

			const body: any = {};
			if (amount > 0) {
				body.amount = {
					value: amount,
					currency: 'USD',
				};
			}
			if (additionalOptions.description) {
				body.description = additionalOptions.description;
			}

			const headers: Record<string, string> = {};
			if (additionalOptions.idempotencyKey) {
				headers['X-Idempotency-Key'] = additionalOptions.idempotencyKey;
			}

			responseData = await client.post(
				`/accounts/${accountId}/transfers/${transferId}/refunds`,
				body,
				{ headers },
			);
			break;
		}

		case 'get': {
			const refundId = this.getNodeParameter('refundId', index) as string;
			responseData = await client.get(
				`/accounts/${accountId}/transfers/${transferId}/refunds/${refundId}`,
			);
			break;
		}

		case 'list': {
			responseData = await client.get(
				`/accounts/${accountId}/transfers/${transferId}/refunds`,
			);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
