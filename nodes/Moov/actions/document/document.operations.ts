/**
 * Moov Document Resource Operations
 * 
 * Documents support identity verification and account onboarding.
 * Includes ID documents, business documents, and proof of address.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['document'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a document',
				action: 'Delete a document',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific document',
				action: 'Get a document',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all documents for an account',
				action: 'List documents',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a document',
				action: 'Upload a document',
			},
		],
		default: 'list',
	},
];

export const documentFields: INodeProperties[] = [
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
				resource: ['document'],
			},
		},
	},
	// Document ID - for get and delete
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the document',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get', 'delete'],
			},
		},
	},
	// Document Type - for upload
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'options',
		required: true,
		default: 'driversLicense',
		options: [
			{ name: 'Articles of Incorporation', value: 'articlesOfIncorporation' },
			{ name: 'Bank Statement', value: 'bankStatement' },
			{ name: 'Business License', value: 'businessLicense' },
			{ name: 'Drivers License', value: 'driversLicense' },
			{ name: 'EIN Letter', value: 'einLetter' },
			{ name: 'Formation Document', value: 'formationDocument' },
			{ name: 'Operating Agreement', value: 'operatingAgreement' },
			{ name: 'Passport', value: 'passport' },
			{ name: 'Proof of Address', value: 'proofOfAddress' },
			{ name: 'SS4 Form', value: 'ss4Form' },
			{ name: 'State ID', value: 'stateId' },
			{ name: 'Tax Return', value: 'taxReturn' },
			{ name: 'Utility Bill', value: 'utilityBill' },
			{ name: 'Voided Check', value: 'voidedCheck' },
		],
		description: 'The type of document being uploaded',
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['upload'],
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
				resource: ['document'],
				operation: ['upload'],
			},
		},
	},
];

export async function executeDocumentOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/documents`);
			break;
		}

		case 'get': {
			const documentId = this.getNodeParameter('documentId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/documents/${documentId}`);
			break;
		}

		case 'upload': {
			const documentType = this.getNodeParameter('documentType', index) as string;
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

			const binaryData = this.helpers.assertBinaryData(index, binaryPropertyName);
			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

			// Upload as multipart form data
			const formData = new FormData();
			formData.append('file', new Blob([buffer]), binaryData.fileName || 'document');
			formData.append('documentType', documentType);

			responseData = await client.post(
				`/accounts/${accountId}/documents`,
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
			const documentId = this.getNodeParameter('documentId', index) as string;
			responseData = await client.delete(`/accounts/${accountId}/documents/${documentId}`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
