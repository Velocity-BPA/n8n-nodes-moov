/**
 * Moov Industry Resource Operations
 * 
 * Industry codes are used for merchant categorization and underwriting.
 * Provides MCC/NAICS code lookup and industry search functionality.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const industryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['industry'],
			},
		},
		options: [
			{
				name: 'Get Codes',
				value: 'getCodes',
				description: 'Get industry codes (MCC/NAICS)',
				action: 'Get industry codes',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all industries',
				action: 'List industries',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for industries',
				action: 'Search industries',
			},
		],
		default: 'list',
	},
];

export const industryFields: INodeProperties[] = [
	// Search Query - for search
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		default: '',
		description: 'Search term for industry name or code',
		displayOptions: {
			show: {
				resource: ['industry'],
				operation: ['search'],
			},
		},
	},
	// Code Type - for getCodes
	{
		displayName: 'Code Type',
		name: 'codeType',
		type: 'options',
		required: true,
		default: 'mcc',
		options: [
			{ name: 'MCC (Merchant Category Code)', value: 'mcc' },
			{ name: 'NAICS', value: 'naics' },
		],
		description: 'The type of industry code to retrieve',
		displayOptions: {
			show: {
				resource: ['industry'],
				operation: ['getCodes'],
			},
		},
	},
	// Code Value - for getCodes
	{
		displayName: 'Code',
		name: 'codeValue',
		type: 'string',
		required: true,
		default: '',
		description: 'The industry code to look up',
		displayOptions: {
			show: {
				resource: ['industry'],
				operation: ['getCodes'],
			},
		},
	},
];

export async function executeIndustryOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get('/industries');
			break;
		}

		case 'search': {
			const searchQuery = this.getNodeParameter('searchQuery', index) as string;
			responseData = await client.get('/industries', {
				query: { search: searchQuery },
			});
			break;
		}

		case 'getCodes': {
			const codeType = this.getNodeParameter('codeType', index) as string;
			const codeValue = this.getNodeParameter('codeValue', index) as string;
			responseData = await client.get(`/industries/${codeType}/${codeValue}`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
