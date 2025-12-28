/**
 * Moov Capability Resource Operations
 * 
 * Capabilities determine what features are enabled for an account.
 * Common capabilities include: transfers, send-funds, collect-funds, wallet, card-issuing.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';
import { CAPABILITY_TYPES, CAPABILITY_STATUSES } from '../../constants/capabilities';

export const capabilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['capability'],
			},
		},
		options: [
			{
				name: 'Disable',
				value: 'disable',
				description: 'Disable a capability for an account',
				action: 'Disable a capability',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific capability for an account',
				action: 'Get a capability',
			},
			{
				name: 'Get Requirements',
				value: 'getRequirements',
				description: 'Get requirements for a capability',
				action: 'Get capability requirements',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all capabilities for an account',
				action: 'List capabilities',
			},
			{
				name: 'Request',
				value: 'request',
				description: 'Request a capability for an account',
				action: 'Request a capability',
			},
		],
		default: 'list',
	},
];

export const capabilityFields: INodeProperties[] = [
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
				resource: ['capability'],
			},
		},
	},
	// Capability Name - for get, disable, request, getRequirements
	{
		displayName: 'Capability',
		name: 'capabilityName',
		type: 'options',
		required: true,
		default: 'transfers',
		options: [
			{ name: 'Card Issuing', value: 'card-issuing' },
			{ name: 'Collect Funds', value: 'collect-funds' },
			{ name: 'Send Funds', value: 'send-funds' },
			{ name: 'Transfers', value: 'transfers' },
			{ name: 'Wallet', value: 'wallet' },
		],
		description: 'The capability to operate on',
		displayOptions: {
			show: {
				resource: ['capability'],
				operation: ['get', 'disable', 'request', 'getRequirements'],
			},
		},
	},
];

export async function executeCapabilityOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/capabilities`);
			break;
		}

		case 'get': {
			const capabilityName = this.getNodeParameter('capabilityName', index) as string;
			responseData = await client.get(`/accounts/${accountId}/capabilities/${capabilityName}`);
			break;
		}

		case 'request': {
			const capabilityName = this.getNodeParameter('capabilityName', index) as string;
			responseData = await client.post(`/accounts/${accountId}/capabilities`, {
				capabilities: [capabilityName],
			});
			break;
		}

		case 'disable': {
			const capabilityName = this.getNodeParameter('capabilityName', index) as string;
			responseData = await client.delete(`/accounts/${accountId}/capabilities/${capabilityName}`);
			break;
		}

		case 'getRequirements': {
			const capabilityName = this.getNodeParameter('capabilityName', index) as string;
			const capabilities = await client.get<{ requirements?: unknown[] }>(`/accounts/${accountId}/capabilities/${capabilityName}`);
			responseData = capabilities.requirements || [];
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
