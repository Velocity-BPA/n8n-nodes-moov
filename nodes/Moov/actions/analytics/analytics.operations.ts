/**
 * Moov Analytics Resource Operations
 * 
 * Analytics provide insights into transfer volumes, account activity, and trends.
 * Useful for reporting and business intelligence.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
		options: [
			{
				name: 'Get Account Analytics',
				value: 'getAccountAnalytics',
				description: 'Get analytics for a specific account',
				action: 'Get account analytics',
			},
			{
				name: 'Get Transfer Analytics',
				value: 'getTransferAnalytics',
				description: 'Get transfer analytics',
				action: 'Get transfer analytics',
			},
			{
				name: 'Get Transfer Summary',
				value: 'getTransferSummary',
				description: 'Get transfer summary statistics',
				action: 'Get transfer summary',
			},
			{
				name: 'Get Volume by Date',
				value: 'getVolumeByDate',
				description: 'Get transfer volume grouped by date',
				action: 'Get volume by date',
			},
		],
		default: 'getTransferAnalytics',
	},
];

export const analyticsFields: INodeProperties[] = [
	// Account ID - for account analytics
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the Moov account',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getAccountAnalytics'],
			},
		},
	},
	// Date Range - for all analytics
	{
		displayName: 'Date Range',
		name: 'dateRange',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: false,
		},
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
		options: [
			{
				name: 'range',
				displayName: 'Date Range',
				values: [
					{
						displayName: 'Start Date',
						name: 'startDate',
						type: 'dateTime',
						default: '',
						description: 'Start of the date range (ISO 8601)',
					},
					{
						displayName: 'End Date',
						name: 'endDate',
						type: 'dateTime',
						default: '',
						description: 'End of the date range (ISO 8601)',
					},
				],
			},
		],
	},
	// Grouping Options - for volume by date
	{
		displayName: 'Group By',
		name: 'groupBy',
		type: 'options',
		default: 'day',
		options: [
			{ name: 'Day', value: 'day' },
			{ name: 'Week', value: 'week' },
			{ name: 'Month', value: 'month' },
		],
		description: 'How to group the volume data',
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getVolumeByDate'],
			},
		},
	},
	// Filter Options
	{
		displayName: 'Filter Options',
		name: 'filterOptions',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getTransferAnalytics', 'getTransferSummary', 'getVolumeByDate'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Pending', value: 'pending' },
				],
				description: 'Filter by transfer status',
			},
			{
				displayName: 'Source Account ID',
				name: 'sourceAccountId',
				type: 'string',
				default: '',
				description: 'Filter by source account',
			},
			{
				displayName: 'Destination Account ID',
				name: 'destinationAccountId',
				type: 'string',
				default: '',
				description: 'Filter by destination account',
			},
		],
	},
];

export async function executeAnalyticsOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const dateRange = this.getNodeParameter('dateRange', index, {}) as {
		range?: { startDate?: string; endDate?: string };
	};

	let responseData: any;

	const qs: Record<string, any> = {};
	if (dateRange.range?.startDate) qs.startDate = dateRange.range.startDate;
	if (dateRange.range?.endDate) qs.endDate = dateRange.range.endDate;

	switch (operation) {
		case 'getTransferAnalytics': {
			const filterOptions = this.getNodeParameter('filterOptions', index, {}) as Record<string, unknown>;
			if (filterOptions.status) qs.status = filterOptions.status as string;
			if (filterOptions.sourceAccountId) qs.sourceAccountId = filterOptions.sourceAccountId as string;
			if (filterOptions.destinationAccountId) qs.destinationAccountId = filterOptions.destinationAccountId as string;

			responseData = await client.get('/analytics/transfers', { query: qs });
			break;
		}

		case 'getAccountAnalytics': {
			const accountId = this.getNodeParameter('accountId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/analytics`, { query: qs });
			break;
		}

		case 'getVolumeByDate': {
			const groupBy = this.getNodeParameter('groupBy', index) as string;
			const filterOptions = this.getNodeParameter('filterOptions', index, {}) as Record<string, unknown>;

			qs.groupBy = groupBy;
			if (filterOptions.status) qs.status = filterOptions.status as string;
			if (filterOptions.sourceAccountId) qs.sourceAccountId = filterOptions.sourceAccountId as string;
			if (filterOptions.destinationAccountId) qs.destinationAccountId = filterOptions.destinationAccountId as string;

			responseData = await client.get('/analytics/transfers/volume', { query: qs });
			break;
		}

		case 'getTransferSummary': {
			const filterOptions = this.getNodeParameter('filterOptions', index, {}) as Record<string, unknown>;
			if (filterOptions.status) qs.status = filterOptions.status as string;
			if (filterOptions.sourceAccountId) qs.sourceAccountId = filterOptions.sourceAccountId as string;
			if (filterOptions.destinationAccountId) qs.destinationAccountId = filterOptions.destinationAccountId as string;

			responseData = await client.get('/analytics/transfers/summary', { query: qs });
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
