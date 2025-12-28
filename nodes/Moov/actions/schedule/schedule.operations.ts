/**
 * Moov Schedule Resource Operations
 * 
 * Scheduled transfers allow recurring or future-dated payments.
 * Supports various frequencies and occurrence management.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const scheduleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
			},
		},
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a scheduled transfer',
				action: 'Cancel scheduled transfer',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a scheduled transfer',
				action: 'Create scheduled transfer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a scheduled transfer',
				action: 'Get scheduled transfer',
			},
			{
				name: 'Get Occurrences',
				value: 'getOccurrences',
				description: 'Get occurrences of a scheduled transfer',
				action: 'Get occurrences',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all scheduled transfers',
				action: 'List scheduled transfers',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a scheduled transfer',
				action: 'Update scheduled transfer',
			},
		],
		default: 'list',
	},
];

export const scheduleFields: INodeProperties[] = [
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
				resource: ['schedule'],
			},
		},
	},
	// Schedule ID - for get, update, cancel, getOccurrences
	{
		displayName: 'Schedule ID',
		name: 'scheduleId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the scheduled transfer',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['get', 'update', 'cancel', 'getOccurrences'],
			},
		},
	},
	// Transfer Details - for create
	{
		displayName: 'Source Payment Method ID',
		name: 'sourcePaymentMethodId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the source payment method',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Destination Payment Method ID',
		name: 'destinationPaymentMethodId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the destination payment method',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Amount (cents)',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Amount in cents (e.g., 1000 = $10.00)',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
	},
	// Schedule Configuration
	{
		displayName: 'Frequency',
		name: 'frequency',
		type: 'options',
		required: true,
		default: 'once',
		options: [
			{ name: 'Once', value: 'once' },
			{ name: 'Daily', value: 'daily' },
			{ name: 'Weekly', value: 'weekly' },
			{ name: 'Bi-Weekly', value: 'biweekly' },
			{ name: 'Monthly', value: 'monthly' },
			{ name: 'Quarterly', value: 'quarterly' },
			{ name: 'Yearly', value: 'yearly' },
		],
		description: 'How often the transfer should occur',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'When the schedule should start (ISO 8601)',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
	},
	// Optional Schedule Settings
	{
		displayName: 'Schedule Options',
		name: 'scheduleOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'When the schedule should end',
			},
			{
				displayName: 'Max Occurrences',
				name: 'maxOccurrences',
				type: 'number',
				default: 0,
				description: 'Maximum number of occurrences (0 = unlimited)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the scheduled transfer',
			},
			{
				displayName: 'Day of Week',
				name: 'dayOfWeek',
				type: 'options',
				default: 'monday',
				options: [
					{ name: 'Sunday', value: 'sunday' },
					{ name: 'Monday', value: 'monday' },
					{ name: 'Tuesday', value: 'tuesday' },
					{ name: 'Wednesday', value: 'wednesday' },
					{ name: 'Thursday', value: 'thursday' },
					{ name: 'Friday', value: 'friday' },
					{ name: 'Saturday', value: 'saturday' },
				],
				description: 'Day of week for weekly schedules',
			},
			{
				displayName: 'Day of Month',
				name: 'dayOfMonth',
				type: 'number',
				default: 1,
				description: 'Day of month for monthly schedules (1-31)',
			},
		],
	},
	// Update Fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Amount (cents)',
				name: 'amount',
				type: 'number',
				default: 0,
				description: 'New amount in cents',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description',
			},
		],
	},
];

export async function executeScheduleOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/schedules`);
			break;
		}

		case 'get': {
			const scheduleId = this.getNodeParameter('scheduleId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/schedules/${scheduleId}`);
			break;
		}

		case 'create': {
			const sourcePaymentMethodId = this.getNodeParameter('sourcePaymentMethodId', index) as string;
			const destinationPaymentMethodId = this.getNodeParameter('destinationPaymentMethodId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const frequency = this.getNodeParameter('frequency', index) as string;
			const startDate = this.getNodeParameter('startDate', index) as string;
			const scheduleOptions = this.getNodeParameter('scheduleOptions', index, {}) as any;

			const body: any = {
				source: {
					paymentMethodID: sourcePaymentMethodId,
				},
				destination: {
					paymentMethodID: destinationPaymentMethodId,
				},
				amount: {
					value: amount,
					currency: 'USD',
				},
				schedule: {
					frequency,
					startDate,
				},
			};

			if (scheduleOptions.endDate) body.schedule.endDate = scheduleOptions.endDate;
			if (scheduleOptions.maxOccurrences) body.schedule.maxOccurrences = scheduleOptions.maxOccurrences;
			if (scheduleOptions.description) body.description = scheduleOptions.description;
			if (scheduleOptions.dayOfWeek && frequency === 'weekly') {
				body.schedule.dayOfWeek = scheduleOptions.dayOfWeek;
			}
			if (scheduleOptions.dayOfMonth && frequency === 'monthly') {
				body.schedule.dayOfMonth = scheduleOptions.dayOfMonth;
			}

			responseData = await client.post(`/accounts/${accountId}/schedules`, body);
			break;
		}

		case 'update': {
			const scheduleId = this.getNodeParameter('scheduleId', index) as string;
			const frequency = this.getNodeParameter('frequency', index) as string;
			const scheduleOptions = this.getNodeParameter('scheduleOptions', index, {}) as any;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;

			const body: any = {
				schedule: {
					frequency,
				},
			};

			if (updateFields.amount) {
				body.amount = { value: updateFields.amount, currency: 'USD' };
			}
			if (updateFields.description) body.description = updateFields.description;
			if (scheduleOptions.endDate) body.schedule.endDate = scheduleOptions.endDate;
			if (scheduleOptions.maxOccurrences) body.schedule.maxOccurrences = scheduleOptions.maxOccurrences;

			responseData = await client.patch(`/accounts/${accountId}/schedules/${scheduleId}`, body);
			break;
		}

		case 'cancel': {
			const scheduleId = this.getNodeParameter('scheduleId', index) as string;
			responseData = await client.delete(`/accounts/${accountId}/schedules/${scheduleId}`);
			break;
		}

		case 'getOccurrences': {
			const scheduleId = this.getNodeParameter('scheduleId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/schedules/${scheduleId}/occurrences`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
