/**
 * Moov Institution Resource Operations
 * 
 * Institutions provide bank and financial institution lookup functionality.
 * Search for banks by name or routing number to get institution details.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const institutionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['institution'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get institution by routing number',
				action: 'Get an institution',
			},
			{
				name: 'Get ACH Participant',
				value: 'getAchParticipant',
				description: 'Get ACH participant details',
				action: 'Get ACH participant',
			},
			{
				name: 'Get Wire Participant',
				value: 'getWireParticipant',
				description: 'Get wire participant details',
				action: 'Get wire participant',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for institutions',
				action: 'Search institutions',
			},
		],
		default: 'search',
	},
];

export const institutionFields: INodeProperties[] = [
	// Routing Number - for get, getAchParticipant, getWireParticipant
	{
		displayName: 'Routing Number',
		name: 'routingNumber',
		type: 'string',
		required: true,
		default: '',
		description: 'The 9-digit ABA routing number',
		displayOptions: {
			show: {
				resource: ['institution'],
				operation: ['get', 'getAchParticipant', 'getWireParticipant'],
			},
		},
	},
	// Search Query - for search
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		default: '',
		description: 'Search term for institution name',
		displayOptions: {
			show: {
				resource: ['institution'],
				operation: ['search'],
			},
		},
	},
	// Search Options
	{
		displayName: 'Search Options',
		name: 'searchOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['institution'],
				operation: ['search'],
			},
		},
		options: [
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'Filter by state (2-letter code)',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 25,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Rail',
				name: 'rail',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'ACH', value: 'ach' },
					{ name: 'Wire', value: 'wire' },
				],
				description: 'Filter by payment rail',
			},
		],
	},
];

export async function executeInstitutionOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'search': {
			const searchQuery = this.getNodeParameter('searchQuery', index) as string;
			const searchOptions = this.getNodeParameter('searchOptions', index, {}) as {
				state?: string;
				count?: number;
				rail?: string;
			};

			const qs: Record<string, string | number | boolean | undefined> = {
				name: searchQuery,
			};
			if (searchOptions.state) qs.state = searchOptions.state;
			if (searchOptions.count) qs.count = searchOptions.count;
			if (searchOptions.rail) qs.rail = searchOptions.rail;

			responseData = await client.get('/institutions', { query: qs });
			break;
		}

		case 'get': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;
			responseData = await client.get(`/institutions/${routingNumber}`);
			break;
		}

		case 'getAchParticipant': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;
			responseData = await client.get(`/institutions/ach/${routingNumber}`);
			break;
		}

		case 'getWireParticipant': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;
			responseData = await client.get(`/institutions/wire/${routingNumber}`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
