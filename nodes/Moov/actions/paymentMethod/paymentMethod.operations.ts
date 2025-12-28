/**
 * Moov Payment Method Resource Operations
 * 
 * Payment methods are the funding sources used in transfers. They can be
 * bank accounts, cards, or wallets.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const paymentMethodOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['paymentMethod'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific payment method',
				action: 'Get a payment method',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all payment methods for an account',
				action: 'List payment methods',
			},
		],
		default: 'list',
	},
];

export const paymentMethodFields: INodeProperties[] = [
	// Account ID - required for all operations
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the Moov account',
		displayOptions: {
			show: {
				resource: ['paymentMethod'],
			},
		},
	},
	// Payment Method ID - for get
	{
		displayName: 'Payment Method ID',
		name: 'paymentMethodId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the payment method',
		displayOptions: {
			show: {
				resource: ['paymentMethod'],
				operation: ['get'],
			},
		},
	},
	// Filters for list
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['paymentMethod'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Source Type',
				name: 'sourceType',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'ACH Debit Fund', value: 'ach-debit-fund' },
					{ name: 'ACH Debit Collect', value: 'ach-debit-collect' },
					{ name: 'ACH Credit Standard', value: 'ach-credit-standard' },
					{ name: 'ACH Credit Same Day', value: 'ach-credit-same-day' },
					{ name: 'Card Payment', value: 'card-payment' },
					{ name: 'Moov Wallet', value: 'moov-wallet' },
					{ name: 'RTP Credit', value: 'rtp-credit' },
				],
				description: 'Filter by payment method source type',
			},
			{
				displayName: 'Payment Method Type',
				name: 'paymentMethodType',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'Bank Account', value: 'bank-account' },
					{ name: 'Card', value: 'card' },
					{ name: 'Wallet', value: 'wallet' },
				],
				description: 'Filter by payment method type',
			},
		],
	},
];

export async function executePaymentMethodOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			const filters = this.getNodeParameter('filters', index) as any;
			
			const queryParams: Record<string, string> = {};
			
			if (filters.sourceType && filters.sourceType.length > 0) {
				queryParams.sourceType = filters.sourceType.join(',');
			}
			if (filters.paymentMethodType && filters.paymentMethodType.length > 0) {
				queryParams.paymentMethodType = filters.paymentMethodType.join(',');
			}

			const queryString = Object.keys(queryParams).length > 0
				? '?' + new URLSearchParams(queryParams).toString()
				: '';

			responseData = await client.get(`/accounts/${accountId}/payment-methods${queryString}`);
			break;
		}

		case 'get': {
			const paymentMethodId = this.getNodeParameter('paymentMethodId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/payment-methods/${paymentMethodId}`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
