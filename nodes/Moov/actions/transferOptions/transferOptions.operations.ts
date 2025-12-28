/**
 * Moov Transfer Options Resource Operations
 * 
 * Transfer options provide information about available transfer methods
 * between accounts, including supported payment rails and estimated timing.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const transferOptionsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transferOptions'],
			},
		},
		options: [
			{
				name: 'Get Available Methods',
				value: 'getAvailableMethods',
				description: 'Get available transfer methods between two accounts',
				action: 'Get available transfer methods',
			},
			{
				name: 'Get Destination Options',
				value: 'getDestinationOptions',
				description: 'Get available destination payment methods',
				action: 'Get destination options',
			},
			{
				name: 'Get Options',
				value: 'getOptions',
				description: 'Get full transfer options between accounts',
				action: 'Get transfer options',
			},
			{
				name: 'Get Source Options',
				value: 'getSourceOptions',
				description: 'Get available source payment methods',
				action: 'Get source options',
			},
		],
		default: 'getOptions',
	},
];

export const transferOptionsFields: INodeProperties[] = [
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
				resource: ['transferOptions'],
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
				resource: ['transferOptions'],
			},
		},
	},
	// Amount for more accurate options
	{
		displayName: 'Amount (Cents)',
		name: 'amount',
		type: 'number',
		default: 0,
		description: 'Transfer amount in cents (for more accurate options)',
		displayOptions: {
			show: {
				resource: ['transferOptions'],
			},
		},
	},
];

export async function executeTransferOptionsOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const sourceAccountId = this.getNodeParameter('sourceAccountId', index) as string;
	const destinationAccountId = this.getNodeParameter('destinationAccountId', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;

	let responseData: any;

	const baseQuery = `source.accountID=${sourceAccountId}&destination.accountID=${destinationAccountId}`;
	const amountQuery = amount > 0 ? `&amount.value=${amount}&amount.currency=USD` : '';

	// Define the response type for transfer options
	interface TransferOptionsResponse {
		sourceOptions?: Array<{ paymentMethodType: string }>;
		destinationOptions?: Array<{ paymentMethodType: string }>;
	}

	switch (operation) {
		case 'getOptions': {
			responseData = await client.get(`/transfer-options?${baseQuery}${amountQuery}`);
			break;
		}

		case 'getSourceOptions': {
			const options = await client.get<TransferOptionsResponse>(`/transfer-options?${baseQuery}${amountQuery}`);
			responseData = {
				sourceAccountId,
				sourceOptions: options.sourceOptions || [],
			};
			break;
		}

		case 'getDestinationOptions': {
			const options = await client.get<TransferOptionsResponse>(`/transfer-options?${baseQuery}${amountQuery}`);
			responseData = {
				destinationAccountId,
				destinationOptions: options.destinationOptions || [],
			};
			break;
		}

		case 'getAvailableMethods': {
			const options = await client.get<TransferOptionsResponse>(`/transfer-options?${baseQuery}${amountQuery}`);
			
			// Extract unique payment methods
			const methods = new Set<string>();
			for (const option of options.sourceOptions || []) {
				methods.add(option.paymentMethodType);
			}
			for (const option of options.destinationOptions || []) {
				methods.add(option.paymentMethodType);
			}

			responseData = {
				sourceAccountId,
				destinationAccountId,
				availableMethods: Array.from(methods),
				sourceOptions: options.sourceOptions,
				destinationOptions: options.destinationOptions,
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
