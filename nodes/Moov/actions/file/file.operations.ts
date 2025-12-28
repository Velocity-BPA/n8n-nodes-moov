/**
 * Moov File Resource Operations
 * 
 * File management for documents, evidence, and other attachments.
 * Supports upload, download, and metadata retrieval.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const fileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		options: [
			{
				name: 'Download',
				value: 'download',
				description: 'Download a file',
				action: 'Download a file',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get file metadata',
				action: 'Get file metadata',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List files for an account',
				action: 'List files',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a file',
				action: 'Upload a file',
			},
		],
		default: 'list',
	},
];

export const fileFields: INodeProperties[] = [
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
				resource: ['file'],
			},
		},
	},
	// File ID - for get and download
	{
		displayName: 'File ID',
		name: 'fileId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the file',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['get', 'download'],
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
		description: 'Name of the binary property containing the file to upload',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload'],
			},
		},
	},
	// File Purpose - for upload
	{
		displayName: 'File Purpose',
		name: 'filePurpose',
		type: 'options',
		required: true,
		default: 'identity-verification',
		options: [
			{ name: 'Business Verification', value: 'business-verification' },
			{ name: 'Dispute Evidence', value: 'dispute-evidence' },
			{ name: 'Identity Verification', value: 'identity-verification' },
			{ name: 'Other', value: 'other' },
		],
		description: 'The purpose of the file',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['upload'],
			},
		},
	},
	// Output Binary Property - for download
	{
		displayName: 'Binary Property Output',
		name: 'binaryPropertyOutput',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the downloaded file',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['download'],
			},
		},
	},
];

export async function executeFileOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/files`);
			break;
		}

		case 'get': {
			const fileId = this.getNodeParameter('fileId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/files/${fileId}`);
			break;
		}

		case 'upload': {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
			const filePurpose = this.getNodeParameter('filePurpose', index) as string;

			const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

			const formData = new FormData();
			formData.append('file', new Blob([buffer]), binaryData.fileName || 'file');
			formData.append('purpose', filePurpose);

			responseData = await client.post(
				`/accounts/${accountId}/files`,
				formData as unknown as Record<string, unknown>,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				},
			);
			break;
		}

		case 'download': {
			const fileId = this.getNodeParameter('fileId', index) as string;
			const binaryPropertyOutput = this.getNodeParameter('binaryPropertyOutput', index) as string;

			// Get file metadata first
			const fileMeta = await client.get<{ name?: string; mimeType?: string }>(`/accounts/${accountId}/files/${fileId}`);

			// Download the file - returns raw binary data
			const fileData = await client.get<ArrayBuffer>(
				`/accounts/${accountId}/files/${fileId}/download`,
			);

			const binaryData = await this.helpers.prepareBinaryData(
				Buffer.from(fileData as unknown as ArrayBuffer),
				fileMeta.name || `file-${fileId}`,
				fileMeta.mimeType || 'application/octet-stream',
			);

			return [{
				json: fileMeta as IDataObject,
				binary: {
					[binaryPropertyOutput]: binaryData,
				},
			}];
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
