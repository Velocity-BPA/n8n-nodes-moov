/**
 * Moov Dispute Resource Operations
 * 
 * Disputes occur when a cardholder questions a transaction with their bank.
 * Handle disputes by accepting them or submitting evidence to contest.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const disputeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
			},
		},
		options: [
			{
				name: 'Accept',
				value: 'accept',
				description: 'Accept a dispute (concede to the cardholder)',
				action: 'Accept a dispute',
			},
			{
				name: 'Delete Evidence',
				value: 'deleteEvidence',
				description: 'Delete evidence from a dispute',
				action: 'Delete evidence',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific dispute',
				action: 'Get a dispute',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all disputes for an account',
				action: 'List disputes',
			},
			{
				name: 'List Evidence',
				value: 'listEvidence',
				description: 'List all evidence for a dispute',
				action: 'List evidence',
			},
			{
				name: 'Submit Evidence',
				value: 'submitEvidence',
				description: 'Submit evidence to contest a dispute',
				action: 'Submit evidence',
			},
			{
				name: 'Upload Evidence',
				value: 'uploadEvidence',
				description: 'Upload evidence file for a dispute',
				action: 'Upload evidence',
			},
		],
		default: 'list',
	},
];

export const disputeFields: INodeProperties[] = [
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
				resource: ['dispute'],
			},
		},
	},
	// Dispute ID
	{
		displayName: 'Dispute ID',
		name: 'disputeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the dispute',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['get', 'accept', 'submitEvidence', 'uploadEvidence', 'listEvidence', 'deleteEvidence'],
			},
		},
	},
	// Evidence ID - for delete
	{
		displayName: 'Evidence ID',
		name: 'evidenceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the evidence',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['deleteEvidence'],
			},
		},
	},
	// Evidence Type - for upload
	{
		displayName: 'Evidence Type',
		name: 'evidenceType',
		type: 'options',
		required: true,
		default: 'generic',
		options: [
			{ name: 'Cancellation Policy', value: 'cancellation-policy' },
			{ name: 'Customer Communication', value: 'customer-communication' },
			{ name: 'Customer Signature', value: 'customer-signature' },
			{ name: 'Duplicate Charge Documentation', value: 'duplicate-charge-documentation' },
			{ name: 'Generic', value: 'generic' },
			{ name: 'Receipt', value: 'receipt' },
			{ name: 'Refund Policy', value: 'refund-policy' },
			{ name: 'Service Documentation', value: 'service-documentation' },
			{ name: 'Shipping Documentation', value: 'shipping-documentation' },
			{ name: 'Uncategorized File', value: 'uncategorized-file' },
		],
		description: 'The type of evidence being uploaded',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['uploadEvidence'],
			},
		},
	},
	// Evidence Text - for upload
	{
		displayName: 'Evidence Text',
		name: 'evidenceText',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Text evidence or description',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['uploadEvidence'],
			},
		},
	},
	// File Data - for upload
	{
		displayName: 'File Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property containing the file to upload',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['uploadEvidence'],
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
				resource: ['dispute'],
				operation: ['list'],
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
					{ name: 'Lost', value: 'lost' },
					{ name: 'Response Needed', value: 'response-needed' },
					{ name: 'Under Review', value: 'under-review' },
					{ name: 'Won', value: 'won' },
				],
				description: 'Filter by dispute status',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 20,
				description: 'Maximum number of disputes to return',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'Number of disputes to skip',
			},
		],
	},
];

export async function executeDisputeOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			const filters = this.getNodeParameter('filters', index, {}) as {
				status?: string;
				count?: number;
				skip?: number;
			};

			const qs: Record<string, string | number | boolean | undefined> = {};
			if (filters.status) qs.status = filters.status as string;
			if (filters.count) qs.count = filters.count as number;
			if (filters.skip) qs.skip = filters.skip as number;

			responseData = await client.get(`/accounts/${accountId}/disputes`, { query: qs });
			break;
		}

		case 'get': {
			const disputeId = this.getNodeParameter('disputeId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/disputes/${disputeId}`);
			break;
		}

		case 'accept': {
			const disputeId = this.getNodeParameter('disputeId', index) as string;
			responseData = await client.post(`/accounts/${accountId}/disputes/${disputeId}/accept`, {});
			break;
		}

		case 'submitEvidence': {
			const disputeId = this.getNodeParameter('disputeId', index) as string;
			responseData = await client.post(`/accounts/${accountId}/disputes/${disputeId}/submit`, {});
			break;
		}

		case 'uploadEvidence': {
			const disputeId = this.getNodeParameter('disputeId', index) as string;
			const evidenceType = this.getNodeParameter('evidenceType', index) as string;
			const evidenceText = this.getNodeParameter('evidenceText', index, '') as string;

			const body: any = {
				evidenceType,
			};
			if (evidenceText) {
				body.text = evidenceText;
			}

			responseData = await client.post(
				`/accounts/${accountId}/disputes/${disputeId}/evidence`,
				body,
			);
			break;
		}

		case 'listEvidence': {
			const disputeId = this.getNodeParameter('disputeId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/disputes/${disputeId}/evidence`);
			break;
		}

		case 'deleteEvidence': {
			const disputeId = this.getNodeParameter('disputeId', index) as string;
			const evidenceId = this.getNodeParameter('evidenceId', index) as string;
			responseData = await client.delete(
				`/accounts/${accountId}/disputes/${disputeId}/evidence/${evidenceId}`,
			);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
