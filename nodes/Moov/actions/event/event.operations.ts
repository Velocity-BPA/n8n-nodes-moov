/**
 * Moov Event Resource Operations
 * 
 * Events represent activities that occur in the Moov platform.
 * Query historical events and get event types for webhook configuration.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const eventOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['event'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific event',
				action: 'Get an event',
			},
			{
				name: 'Get by Resource',
				value: 'getByResource',
				description: 'Get events for a specific resource',
				action: 'Get events by resource',
			},
			{
				name: 'Get Types',
				value: 'getTypes',
				description: 'Get all available event types',
				action: 'Get event types',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all events',
				action: 'List events',
			},
		],
		default: 'list',
	},
];

export const eventFields: INodeProperties[] = [
	// Event ID - for get
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the event',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['get'],
			},
		},
	},
	// Resource Type - for getByResource
	{
		displayName: 'Resource Type',
		name: 'resourceType',
		type: 'options',
		required: true,
		default: 'account',
		options: [
			{ name: 'Account', value: 'account' },
			{ name: 'Bank Account', value: 'bank-account' },
			{ name: 'Capability', value: 'capability' },
			{ name: 'Card', value: 'card' },
			{ name: 'Dispute', value: 'dispute' },
			{ name: 'Refund', value: 'refund' },
			{ name: 'Transfer', value: 'transfer' },
			{ name: 'Wallet', value: 'wallet' },
		],
		description: 'Type of resource to get events for',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['getByResource'],
			},
		},
	},
	// Resource ID - for getByResource
	{
		displayName: 'Resource ID',
		name: 'resourceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the resource',
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['getByResource'],
			},
		},
	},
	// List Filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Event Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Filter by event type (e.g., transfer.created)',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Filter events from this date',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Filter events until this date',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 20,
				description: 'Maximum number of events to return',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of events to skip',
			},
		],
	},
];

export async function executeEventOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			const filters = this.getNodeParameter('filters', index, {}) as {
				type?: string;
				startDate?: string;
				endDate?: string;
				count?: number;
				skip?: number;
			};

			const qs: Record<string, string | number | boolean | undefined> = {};
			if (filters.type) qs.type = filters.type;
			if (filters.startDate) qs.startDate = filters.startDate;
			if (filters.endDate) qs.endDate = filters.endDate;
			if (filters.count) qs.count = filters.count;
			if (filters.skip) qs.skip = filters.skip;

			responseData = await client.get('/events', { query: qs });
			break;
		}

		case 'get': {
			const eventId = this.getNodeParameter('eventId', index) as string;
			responseData = await client.get(`/events/${eventId}`);
			break;
		}

		case 'getByResource': {
			const resourceType = this.getNodeParameter('resourceType', index) as string;
			const resourceId = this.getNodeParameter('resourceId', index) as string;

			// Map resource type to API endpoint
			const resourceEndpoints: Record<string, string> = {
				'account': 'accounts',
				'bank-account': 'bank-accounts',
				'capability': 'capabilities',
				'card': 'cards',
				'dispute': 'disputes',
				'refund': 'refunds',
				'transfer': 'transfers',
				'wallet': 'wallets',
			};

			const endpoint = resourceEndpoints[resourceType] || resourceType;
			responseData = await client.get(`/${endpoint}/${resourceId}/events`);
			break;
		}

		case 'getTypes': {
			responseData = await client.get('/events/types');
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
