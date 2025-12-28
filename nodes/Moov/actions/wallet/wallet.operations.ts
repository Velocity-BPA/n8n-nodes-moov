/**
 * Moov Wallet Resource Operations
 * 
 * Wallets are Moov-held balances for accounts. They enable instant transfers
 * between Moov accounts and can be used to store funds.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const walletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['wallet'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific wallet',
				action: 'Get a wallet',
			},
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get the current balance of a wallet',
				action: 'Get wallet balance',
			},
			{
				name: 'Get Transactions',
				value: 'getTransactions',
				description: 'Get transactions for a wallet',
				action: 'Get wallet transactions',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all wallets for an account',
				action: 'List wallets',
			},
		],
		default: 'list',
	},
];

export const walletFields: INodeProperties[] = [
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
				resource: ['wallet'],
			},
		},
	},
	// Wallet ID - for get, getBalance, getTransactions
	{
		displayName: 'Wallet ID',
		name: 'walletId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the wallet',
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['get', 'getBalance', 'getTransactions'],
			},
		},
	},
	// Transaction filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['wallet'],
				operation: ['getTransactions'],
			},
		},
		options: [
			{
				displayName: 'Transaction Type',
				name: 'transactionType',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'ACH Credit', value: 'ach-credit' },
					{ name: 'ACH Debit', value: 'ach-debit' },
					{ name: 'Card Payment', value: 'card-payment' },
					{ name: 'Cash Out', value: 'cash-out' },
					{ name: 'Dispute', value: 'dispute' },
					{ name: 'Dispute Reversal', value: 'dispute-reversal' },
					{ name: 'Fee', value: 'fee' },
					{ name: 'Interest', value: 'interest' },
					{ name: 'Other', value: 'other' },
					{ name: 'Payout', value: 'payout' },
					{ name: 'Refund', value: 'refund' },
					{ name: 'RTP Credit', value: 'rtp-credit' },
					{ name: 'RTP Debit', value: 'rtp-debit' },
					{ name: 'Top Up', value: 'top-up' },
					{ name: 'Wallet Transfer', value: 'wallet-transfer' },
				],
				description: 'Filter by transaction type',
			},
			{
				displayName: 'Source Type',
				name: 'sourceType',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Transfer', value: 'transfer' },
					{ name: 'Dispute', value: 'dispute' },
					{ name: 'Issuing Transaction', value: 'issuing-transaction' },
				],
				description: 'Filter by source type',
			},
			{
				displayName: 'Source ID',
				name: 'sourceId',
				type: 'string',
				default: '',
				description: 'Filter by source ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Canceled', value: 'canceled' },
				],
				description: 'Filter by status',
			},
			{
				displayName: 'Created On Or After',
				name: 'createdOnOrAfter',
				type: 'dateTime',
				default: '',
				description: 'Filter transactions created on or after this date',
			},
			{
				displayName: 'Created On Or Before',
				name: 'createdOnOrBefore',
				type: 'dateTime',
				default: '',
				description: 'Filter transactions created on or before this date',
			},
			{
				displayName: 'Limit',
				name: 'count',
				type: 'number',
				default: 50,
				description: 'Maximum number of transactions to return',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of transactions to skip',
			},
		],
	},
];

export async function executeWalletOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/wallets`);
			break;
		}

		case 'get': {
			const walletId = this.getNodeParameter('walletId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/wallets/${walletId}`);
			break;
		}

		case 'getBalance': {
			const walletId = this.getNodeParameter('walletId', index) as string;
			const wallet = await client.get<{ availableBalance?: { currency?: string; value?: number } }>(`/accounts/${accountId}/wallets/${walletId}`);
			responseData = {
				walletId,
				availableBalance: wallet.availableBalance,
				currency: wallet.availableBalance?.currency || 'USD',
			};
			break;
		}

		case 'getTransactions': {
			const walletId = this.getNodeParameter('walletId', index) as string;
			const filters = this.getNodeParameter('filters', index) as any;

			const queryParams: Record<string, string> = {};
			
			if (filters.transactionType) queryParams.transactionType = filters.transactionType;
			if (filters.sourceType) queryParams.sourceType = filters.sourceType;
			if (filters.sourceId) queryParams.sourceID = filters.sourceId;
			if (filters.status) queryParams.status = filters.status;
			if (filters.createdOnOrAfter) queryParams.createdOnOrAfter = filters.createdOnOrAfter;
			if (filters.createdOnOrBefore) queryParams.createdOnOrBefore = filters.createdOnOrBefore;
			if (filters.count) queryParams.count = String(filters.count);
			if (filters.skip) queryParams.skip = String(filters.skip);

			const queryString = Object.keys(queryParams).length > 0
				? '?' + new URLSearchParams(queryParams).toString()
				: '';

			responseData = await client.get(`/accounts/${accountId}/wallets/${walletId}/transactions${queryString}`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
