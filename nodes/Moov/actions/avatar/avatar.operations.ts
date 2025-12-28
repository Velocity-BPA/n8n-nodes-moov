/**
 * Moov Avatar Resource Operations
 * 
 * Avatars are profile images for accounts.
 * Supports upload, retrieval, and deletion of account avatars.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const avatarOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['avatar'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an avatar',
				action: 'Delete an avatar',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get avatar URL for an account',
				action: 'Get avatar',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload an avatar image',
				action: 'Upload avatar',
			},
		],
		default: 'get',
	},
];

export const avatarFields: INodeProperties[] = [
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
				resource: ['avatar'],
			},
		},
	},
	// Binary Property Name - for upload
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the image to upload (PNG, JPG, or GIF)',
		displayOptions: {
			show: {
				resource: ['avatar'],
				operation: ['upload'],
			},
		},
	},
];

export async function executeAvatarOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'get': {
			responseData = await client.get(`/accounts/${accountId}/avatar`);
			break;
		}

		case 'upload': {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

			const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

			// Validate image type
			const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];
			if (!allowedMimeTypes.includes(binaryData.mimeType || '')) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid image format. Allowed formats: PNG, JPG, GIF',
				);
			}

			const formData = new FormData();
			formData.append(
				'avatar',
				new Blob([buffer], { type: binaryData.mimeType }),
				binaryData.fileName || 'avatar',
			);

			responseData = await client.post(
				`/accounts/${accountId}/avatar`,
				formData as unknown as Record<string, unknown>,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			break;
		}

		case 'delete': {
			responseData = await client.delete(`/accounts/${accountId}/avatar`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
