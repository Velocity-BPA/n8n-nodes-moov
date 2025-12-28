/**
 * Moov Representative Resource Operations
 * 
 * Representatives are individuals associated with a business account who have
 * significant control or ownership. Required for KYC/AML compliance.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';
import { REPRESENTATIVE_RESPONSIBILITIES } from '../../constants';

export const representativeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['representative'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a representative for an account',
				action: 'Create a representative',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a representative from an account',
				action: 'Delete a representative',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific representative',
				action: 'Get a representative',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all representatives for an account',
				action: 'List representatives',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a representative',
				action: 'Update a representative',
			},
		],
		default: 'list',
	},
];

export const representativeFields: INodeProperties[] = [
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
				resource: ['representative'],
			},
		},
	},
	// Representative ID - for get, update, delete
	{
		displayName: 'Representative ID',
		name: 'representativeId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the representative',
		displayOptions: {
			show: {
				resource: ['representative'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	// Name fields for create/update
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		default: '',
		description: 'Legal first name of the representative',
		displayOptions: {
			show: {
				resource: ['representative'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		default: '',
		description: 'Legal last name of the representative',
		displayOptions: {
			show: {
				resource: ['representative'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Responsibilities',
		name: 'responsibilities',
		type: 'multiOptions',
		required: true,
		default: [],
		options: [
			{ name: 'Controller', value: 'controller' },
			{ name: 'Owner', value: 'owner' },
		],
		description: 'Roles and responsibilities of the representative',
		displayOptions: {
			show: {
				resource: ['representative'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['representative'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Middle Name',
				name: 'middleName',
				type: 'string',
				default: '',
				description: 'Middle name of the representative',
			},
			{
				displayName: 'Suffix',
				name: 'suffix',
				type: 'string',
				default: '',
				description: 'Name suffix (e.g., Jr., III)',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'representative@example.com',
				description: 'Email address of the representative',
			},
			{
				displayName: 'Phone Number',
				name: 'phone',
				type: 'string',
				default: '',
				placeholder: '+15555555555',
				description: 'Phone number in E.164 format',
			},
			{
				displayName: 'Date of Birth',
				name: 'birthDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'Date of birth of the representative',
			},
			{
				displayName: 'SSN (Last 4)',
				name: 'ssnLast4',
				type: 'string',
				default: '',
				placeholder: '1234',
				description: 'Last 4 digits of Social Security Number',
			},
			{
				displayName: 'Full SSN',
				name: 'ssn',
				type: 'string',
				default: '',
				placeholder: '123-45-6789',
				description: 'Full Social Security Number (9 digits)',
			},
			{
				displayName: 'Address Line 1',
				name: 'addressLine1',
				type: 'string',
				default: '',
				description: 'Street address line 1',
			},
			{
				displayName: 'Address Line 2',
				name: 'addressLine2',
				type: 'string',
				default: '',
				description: 'Street address line 2',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City name',
			},
			{
				displayName: 'State/Province',
				name: 'stateOrProvince',
				type: 'string',
				default: '',
				description: 'State or province code',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				description: 'Postal/ZIP code',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: 'US',
				description: 'Two-letter country code (ISO 3166-1 alpha-2)',
			},
			{
				displayName: 'Ownership Percentage',
				name: 'ownershipPercentage',
				type: 'number',
				default: 0,
				description: 'Percentage of business ownership (0-100)',
			},
			{
				displayName: 'Job Title',
				name: 'jobTitle',
				type: 'string',
				default: '',
				description: 'Job title of the representative',
			},
		],
	},
];

export async function executeRepresentativeOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/representatives`);
			break;
		}

		case 'get': {
			const representativeId = this.getNodeParameter('representativeId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/representatives/${representativeId}`);
			break;
		}

		case 'create': {
			const firstName = this.getNodeParameter('firstName', index) as string;
			const lastName = this.getNodeParameter('lastName', index) as string;
			const responsibilities = this.getNodeParameter('responsibilities', index) as string[];
			const additionalFields = this.getNodeParameter('additionalFields', index) as any;

			const body: any = {
				name: {
					firstName,
					lastName,
				},
				responsibilities: {
					isController: responsibilities.includes('controller'),
					isOwner: responsibilities.includes('owner'),
				},
			};

			if (additionalFields.middleName) {
				body.name.middleName = additionalFields.middleName;
			}
			if (additionalFields.suffix) {
				body.name.suffix = additionalFields.suffix;
			}
			if (additionalFields.email) {
				body.email = additionalFields.email;
			}
			if (additionalFields.phone) {
				body.phone = { number: additionalFields.phone, countryCode: '1' };
			}
			if (additionalFields.birthDate) {
				const [year, month, day] = additionalFields.birthDate.split('-');
				body.birthDate = { day: parseInt(day), month: parseInt(month), year: parseInt(year) };
			}
			if (additionalFields.ssnLast4 || additionalFields.ssn) {
				body.governmentID = {};
				if (additionalFields.ssnLast4) {
					body.governmentID.ssn = { lastFour: additionalFields.ssnLast4 };
				}
				if (additionalFields.ssn) {
					body.governmentID.ssn = { full: additionalFields.ssn.replace(/-/g, '') };
				}
			}
			if (additionalFields.addressLine1) {
				body.address = {
					addressLine1: additionalFields.addressLine1,
					addressLine2: additionalFields.addressLine2 || undefined,
					city: additionalFields.city,
					stateOrProvince: additionalFields.stateOrProvince,
					postalCode: additionalFields.postalCode,
					country: additionalFields.country || 'US',
				};
			}
			if (additionalFields.ownershipPercentage) {
				body.responsibilities.ownershipPercentage = additionalFields.ownershipPercentage;
			}
			if (additionalFields.jobTitle) {
				body.responsibilities.jobTitle = additionalFields.jobTitle;
			}

			responseData = await client.post(`/accounts/${accountId}/representatives`, body);
			break;
		}

		case 'update': {
			const representativeId = this.getNodeParameter('representativeId', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index) as any;

			const body: any = {};

			if (additionalFields.email) {
				body.email = additionalFields.email;
			}
			if (additionalFields.phone) {
				body.phone = { number: additionalFields.phone, countryCode: '1' };
			}
			if (additionalFields.addressLine1) {
				body.address = {
					addressLine1: additionalFields.addressLine1,
					addressLine2: additionalFields.addressLine2 || undefined,
					city: additionalFields.city,
					stateOrProvince: additionalFields.stateOrProvince,
					postalCode: additionalFields.postalCode,
					country: additionalFields.country || 'US',
				};
			}
			if (additionalFields.jobTitle) {
				body.responsibilities = body.responsibilities || {};
				body.responsibilities.jobTitle = additionalFields.jobTitle;
			}

			responseData = await client.patch(`/accounts/${accountId}/representatives/${representativeId}`, body);
			break;
		}

		case 'delete': {
			const representativeId = this.getNodeParameter('representativeId', index) as string;
			await client.delete(`/accounts/${accountId}/representatives/${representativeId}`);
			responseData = { success: true, representativeId };
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
