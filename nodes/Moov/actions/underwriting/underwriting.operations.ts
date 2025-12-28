/**
 * Moov Underwriting Resource Operations
 * 
 * Underwriting is the risk assessment process for accounts.
 * Required for certain capabilities like send-funds and collect-funds.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const underwritingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['underwriting'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get underwriting details for an account',
				action: 'Get underwriting',
			},
			{
				name: 'Request Review',
				value: 'requestReview',
				description: 'Request an underwriting review',
				action: 'Request underwriting review',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update underwriting information',
				action: 'Update underwriting',
			},
		],
		default: 'get',
	},
];

export const underwritingFields: INodeProperties[] = [
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
				resource: ['underwriting'],
			},
		},
	},
	// Underwriting Data - for update
	{
		displayName: 'Underwriting Data',
		name: 'underwritingData',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['underwriting'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Average Transaction Size',
				name: 'averageTransactionSize',
				type: 'number',
				default: 0,
				description: 'Average transaction size in cents',
			},
			{
				displayName: 'Max Transaction Size',
				name: 'maxTransactionSize',
				type: 'number',
				default: 0,
				description: 'Maximum transaction size in cents',
			},
			{
				displayName: 'Average Monthly Transaction Volume',
				name: 'averageMonthlyTransactionVolume',
				type: 'number',
				default: 0,
				description: 'Average monthly transaction volume in cents',
			},
			{
				displayName: 'Volume by Customer Type',
				name: 'volumeByCustomerType',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'percentages',
						displayName: 'Customer Type Percentages',
						values: [
							{
								displayName: 'Business to Business',
								name: 'businessToBusiness',
								type: 'number',
								default: 0,
								description: 'Percentage of B2B transactions',
							},
							{
								displayName: 'Consumer to Business',
								name: 'consumerToBusiness',
								type: 'number',
								default: 0,
								description: 'Percentage of C2B transactions',
							},
						],
					},
				],
			},
			{
				displayName: 'Card Volume Distribution',
				name: 'cardVolumeDistribution',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'distribution',
						displayName: 'Card Distribution',
						values: [
							{
								displayName: 'E-Commerce',
								name: 'ecommerce',
								type: 'number',
								default: 0,
								description: 'Percentage of e-commerce transactions',
							},
							{
								displayName: 'Card Present',
								name: 'cardPresent',
								type: 'number',
								default: 0,
								description: 'Percentage of card-present transactions',
							},
							{
								displayName: 'Mail/Telephone Order',
								name: 'mailTelephoneOrder',
								type: 'number',
								default: 0,
								description: 'Percentage of MOTO transactions',
							},
						],
					},
				],
			},
			{
				displayName: 'Fulfillment',
				name: 'fulfillment',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: false,
				},
				options: [
					{
						name: 'details',
						displayName: 'Fulfillment Details',
						values: [
							{
								displayName: 'Has Physical Goods',
								name: 'hasPhysicalGoods',
								type: 'boolean',
								default: false,
								description: 'Whether the business ships physical goods',
							},
							{
								displayName: 'Is Marketplace',
								name: 'isMarketplace',
								type: 'boolean',
								default: false,
								description: 'Whether the business is a marketplace',
							},
							{
								displayName: 'Shipment Duration Days',
								name: 'shipmentDurationDays',
								type: 'number',
								default: 0,
								description: 'Average days to ship',
							},
							{
								displayName: 'Service Duration Days',
								name: 'serviceDurationDays',
								type: 'number',
								default: 0,
								description: 'Average days to fulfill service',
							},
						],
					},
				],
			},
		],
	},
];

export async function executeUnderwritingOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'get': {
			responseData = await client.get(`/accounts/${accountId}/underwriting`);
			break;
		}

		case 'update': {
			const underwritingData = this.getNodeParameter('underwritingData', index, {}) as any;

			const body: any = {};

			if (underwritingData.averageTransactionSize) {
				body.averageTransactionSize = underwritingData.averageTransactionSize;
			}
			if (underwritingData.maxTransactionSize) {
				body.maxTransactionSize = underwritingData.maxTransactionSize;
			}
			if (underwritingData.averageMonthlyTransactionVolume) {
				body.averageMonthlyTransactionVolume = underwritingData.averageMonthlyTransactionVolume;
			}
			if (underwritingData.volumeByCustomerType?.percentages) {
				body.volumeByCustomerType = underwritingData.volumeByCustomerType.percentages;
			}
			if (underwritingData.cardVolumeDistribution?.distribution) {
				body.cardVolumeDistribution = underwritingData.cardVolumeDistribution.distribution;
			}
			if (underwritingData.fulfillment?.details) {
				body.fulfillment = underwritingData.fulfillment.details;
			}

			responseData = await client.put(`/accounts/${accountId}/underwriting`, body);
			break;
		}

		case 'requestReview': {
			responseData = await client.post(`/accounts/${accountId}/underwriting/request-review`, {});
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
