/**
 * Moov Bank Account Resource Operations
 * 
 * Bank accounts are payment methods used for ACH transfers. They can be linked
 * manually with routing/account numbers, or via instant verification (Plaid/MX).
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';
import { BANK_ACCOUNT_TYPES, BANK_ACCOUNT_HOLDER_TYPES } from '../../constants/transferTypes';

export const bankAccountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bankAccount'],
			},
		},
		options: [
			{
				name: 'Complete Micro Deposits',
				value: 'completeMicroDeposits',
				description: 'Complete micro-deposit verification with amounts',
				action: 'Complete micro deposits',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a bank account from an account',
				action: 'Delete a bank account',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific bank account',
				action: 'Get a bank account',
			},
			{
				name: 'Get Instant Verification Link',
				value: 'getInstantVerificationLink',
				description: 'Get a link for instant bank verification via Plaid',
				action: 'Get instant verification link',
			},
			{
				name: 'Initiate Micro Deposits',
				value: 'initiateMicroDeposits',
				description: 'Initiate micro-deposit verification',
				action: 'Initiate micro deposits',
			},
			{
				name: 'Link',
				value: 'link',
				description: 'Link a bank account to an account',
				action: 'Link a bank account',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all bank accounts for an account',
				action: 'List bank accounts',
			},
		],
		default: 'list',
	},
];

export const bankAccountFields: INodeProperties[] = [
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
				resource: ['bankAccount'],
			},
		},
	},
	// Bank Account ID - for get, delete, micro-deposits
	{
		displayName: 'Bank Account ID',
		name: 'bankAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the bank account',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['get', 'delete', 'initiateMicroDeposits', 'completeMicroDeposits'],
			},
		},
	},
	// Link bank account fields
	{
		displayName: 'Routing Number',
		name: 'routingNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '123456789',
		description: 'Bank routing number (9 digits)',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Account Number',
		name: 'accountNumber',
		type: 'string',
		required: true,
		default: '',
		description: 'Bank account number',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Account Type',
		name: 'bankAccountType',
		type: 'options',
		required: true,
		default: 'checking',
		options: [
			{ name: 'Checking', value: 'checking' },
			{ name: 'Savings', value: 'savings' },
			{ name: 'General Ledger', value: 'general-ledger' },
			{ name: 'Loan', value: 'loan' },
		],
		description: 'Type of bank account',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Holder Name',
		name: 'holderName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the account holder',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Holder Type',
		name: 'holderType',
		type: 'options',
		required: true,
		default: 'individual',
		options: [
			{ name: 'Individual', value: 'individual' },
			{ name: 'Business', value: 'business' },
		],
		description: 'Type of account holder',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['link'],
			},
		},
	},
	// Micro-deposit amounts for verification
	{
		displayName: 'Deposit Amount 1 (Cents)',
		name: 'amount1',
		type: 'number',
		required: true,
		default: 0,
		description: 'First micro-deposit amount in cents (e.g., 12 for $0.12)',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['completeMicroDeposits'],
			},
		},
	},
	{
		displayName: 'Deposit Amount 2 (Cents)',
		name: 'amount2',
		type: 'number',
		required: true,
		default: 0,
		description: 'Second micro-deposit amount in cents (e.g., 34 for $0.34)',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['completeMicroDeposits'],
			},
		},
	},
	// Additional options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['link', 'getInstantVerificationLink'],
			},
		},
		options: [
			{
				displayName: 'Bank Name',
				name: 'bankName',
				type: 'string',
				default: '',
				description: 'Name of the bank',
			},
			{
				displayName: 'Redirect URL',
				name: 'redirectUrl',
				type: 'string',
				default: '',
				description: 'URL to redirect after instant verification',
			},
		],
	},
];

export async function executeBankAccountOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/bank-accounts`);
			break;
		}

		case 'get': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/bank-accounts/${bankAccountId}`);
			break;
		}

		case 'link': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;
			const accountNumber = this.getNodeParameter('accountNumber', index) as string;
			const bankAccountType = this.getNodeParameter('bankAccountType', index) as string;
			const holderName = this.getNodeParameter('holderName', index) as string;
			const holderType = this.getNodeParameter('holderType', index) as string;
			const options = this.getNodeParameter('options', index) as any;

			const body: any = {
				account: {
					routingNumber,
					accountNumber,
				},
				bankAccountType,
				holderName,
				holderType,
			};

			if (options.bankName) {
				body.bankName = options.bankName;
			}

			responseData = await client.post(`/accounts/${accountId}/bank-accounts`, body);
			break;
		}

		case 'delete': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			await client.delete(`/accounts/${accountId}/bank-accounts/${bankAccountId}`);
			responseData = { success: true, bankAccountId };
			break;
		}

		case 'initiateMicroDeposits': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await client.post(`/accounts/${accountId}/bank-accounts/${bankAccountId}/micro-deposits`, {});
			break;
		}

		case 'completeMicroDeposits': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const amount1 = this.getNodeParameter('amount1', index) as number;
			const amount2 = this.getNodeParameter('amount2', index) as number;

			responseData = await client.put(`/accounts/${accountId}/bank-accounts/${bankAccountId}/micro-deposits`, {
				amounts: [amount1, amount2],
			});
			break;
		}

		case 'getInstantVerificationLink': {
			const options = this.getNodeParameter('options', index) as any;
			const body: any = {};
			
			if (options.redirectUrl) {
				body.redirectUrl = options.redirectUrl;
			}

			responseData = await client.post(`/accounts/${accountId}/bank-accounts/instant-verification`, body);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
