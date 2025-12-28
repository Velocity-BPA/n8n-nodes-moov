/**
 * Moov Verification Resource Operations
 * 
 * Verification handles identity verification for accounts.
 * Includes KYC/KYB processes and document verification.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const verificationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['verification'],
			},
		},
		options: [
			{
				name: 'Complete',
				value: 'complete',
				description: 'Complete a verification process',
				action: 'Complete verification',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get verification status for an account',
				action: 'Get verification',
			},
			{
				name: 'Initiate',
				value: 'initiate',
				description: 'Initiate a verification process',
				action: 'Initiate verification',
			},
		],
		default: 'get',
	},
];

export const verificationFields: INodeProperties[] = [
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
				resource: ['verification'],
			},
		},
	},
	// Verification Type - for initiate
	{
		displayName: 'Verification Type',
		name: 'verificationType',
		type: 'options',
		required: true,
		default: 'identity',
		options: [
			{ name: 'Identity', value: 'identity' },
			{ name: 'Document', value: 'document' },
			{ name: 'Address', value: 'address' },
		],
		description: 'The type of verification to initiate',
		displayOptions: {
			show: {
				resource: ['verification'],
				operation: ['initiate'],
			},
		},
	},
	// Verification Code - for complete
	{
		displayName: 'Verification Code',
		name: 'verificationCode',
		type: 'string',
		required: true,
		default: '',
		description: 'The verification code received',
		displayOptions: {
			show: {
				resource: ['verification'],
				operation: ['complete'],
			},
		},
	},
	// Verification ID - for complete
	{
		displayName: 'Verification ID',
		name: 'verificationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the verification',
		displayOptions: {
			show: {
				resource: ['verification'],
				operation: ['complete'],
			},
		},
	},
];

export async function executeVerificationOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'get': {
			responseData = await client.get(`/accounts/${accountId}/verification`);
			break;
		}

		case 'initiate': {
			const verificationType = this.getNodeParameter('verificationType', index) as string;
			responseData = await client.post(`/accounts/${accountId}/verification`, {
				type: verificationType,
			});
			break;
		}

		case 'complete': {
			const verificationId = this.getNodeParameter('verificationId', index) as string;
			const verificationCode = this.getNodeParameter('verificationCode', index) as string;
			responseData = await client.post(
				`/accounts/${accountId}/verification/${verificationId}/complete`,
				{ code: verificationCode },
			);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
