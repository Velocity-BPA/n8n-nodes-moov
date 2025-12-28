/**
 * Moov Enrichment Resource Operations
 * 
 * Enrichment provides enhanced data for accounts and addresses.
 * Includes address standardization and profile enhancement.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const enrichmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['enrichment'],
			},
		},
		options: [
			{
				name: 'Enrich Address',
				value: 'enrichAddress',
				description: 'Standardize and validate an address',
				action: 'Enrich address',
			},
			{
				name: 'Enrich Profile',
				value: 'enrichProfile',
				description: 'Enhance profile data for an account',
				action: 'Enrich profile',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get enrichment data for an account',
				action: 'Get enrichment',
			},
		],
		default: 'get',
	},
];

export const enrichmentFields: INodeProperties[] = [
	// Account ID - for get and enrichProfile
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the Moov account',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['get', 'enrichProfile'],
			},
		},
	},
	// Address Fields - for enrichAddress
	{
		displayName: 'Address Line 1',
		name: 'addressLine1',
		type: 'string',
		required: true,
		default: '',
		description: 'Street address line 1',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['enrichAddress'],
			},
		},
	},
	{
		displayName: 'Address Line 2',
		name: 'addressLine2',
		type: 'string',
		default: '',
		description: 'Street address line 2 (apartment, suite, etc.)',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['enrichAddress'],
			},
		},
	},
	{
		displayName: 'City',
		name: 'city',
		type: 'string',
		required: true,
		default: '',
		description: 'City name',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['enrichAddress'],
			},
		},
	},
	{
		displayName: 'State/Province',
		name: 'stateOrProvince',
		type: 'string',
		required: true,
		default: '',
		description: 'State or province code (e.g., CA, NY)',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['enrichAddress'],
			},
		},
	},
	{
		displayName: 'Postal Code',
		name: 'postalCode',
		type: 'string',
		required: true,
		default: '',
		description: 'ZIP or postal code',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['enrichAddress'],
			},
		},
	},
	{
		displayName: 'Country',
		name: 'country',
		type: 'string',
		default: 'US',
		description: 'Country code (ISO 3166-1 alpha-2)',
		displayOptions: {
			show: {
				resource: ['enrichment'],
				operation: ['enrichAddress'],
			},
		},
	},
];

export async function executeEnrichmentOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'get': {
			const accountId = this.getNodeParameter('accountId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/enrichment`);
			break;
		}

		case 'enrichProfile': {
			const accountId = this.getNodeParameter('accountId', index) as string;
			responseData = await client.post(`/accounts/${accountId}/enrichment`, {});
			break;
		}

		case 'enrichAddress': {
			const address = {
				addressLine1: this.getNodeParameter('addressLine1', index) as string,
				addressLine2: this.getNodeParameter('addressLine2', index, '') as string,
				city: this.getNodeParameter('city', index) as string,
				stateOrProvince: this.getNodeParameter('stateOrProvince', index) as string,
				postalCode: this.getNodeParameter('postalCode', index) as string,
				country: this.getNodeParameter('country', index) as string,
			};

			// Remove empty addressLine2 if not provided
			if (!address.addressLine2) {
				delete (address as any).addressLine2;
			}

			responseData = await client.post('/enrichment/address', { address });
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
