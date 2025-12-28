/**
 * Moov Onboarding Resource Operations
 * 
 * Onboarding provides hosted flows for account creation and verification.
 * Generate links, track status, and manage invitations.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const onboardingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['onboarding'],
			},
		},
		options: [
			{
				name: 'Create Link',
				value: 'createLink',
				description: 'Create an onboarding link',
				action: 'Create onboarding link',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get onboarding status',
				action: 'Get onboarding status',
			},
			{
				name: 'List Invites',
				value: 'listInvites',
				description: 'List onboarding invites',
				action: 'List onboarding invites',
			},
			{
				name: 'Resend Invite',
				value: 'resendInvite',
				description: 'Resend an onboarding invite',
				action: 'Resend onboarding invite',
			},
		],
		default: 'createLink',
	},
];

export const onboardingFields: INodeProperties[] = [
	// Account ID - for getStatus
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the account',
		displayOptions: {
			show: {
				resource: ['onboarding'],
				operation: ['getStatus'],
			},
		},
	},
	// Invite ID - for resendInvite
	{
		displayName: 'Invite ID',
		name: 'inviteId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the invite',
		displayOptions: {
			show: {
				resource: ['onboarding'],
				operation: ['resendInvite'],
			},
		},
	},
	// Link Configuration - for createLink
	{
		displayName: 'Link Type',
		name: 'linkType',
		type: 'options',
		required: true,
		default: 'individual',
		options: [
			{ name: 'Individual', value: 'individual' },
			{ name: 'Business', value: 'business' },
		],
		description: 'Type of account to onboard',
		displayOptions: {
			show: {
				resource: ['onboarding'],
				operation: ['createLink'],
			},
		},
	},
	// Onboarding Link Options
	{
		displayName: 'Link Options',
		name: 'linkOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['onboarding'],
				operation: ['createLink'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Pre-fill email for the onboarding flow',
			},
			{
				displayName: 'Redirect URL',
				name: 'redirectUrl',
				type: 'string',
				default: '',
				description: 'URL to redirect after onboarding completion',
			},
			{
				displayName: 'Capabilities',
				name: 'capabilities',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'Card Issuing', value: 'card-issuing' },
					{ name: 'Collect Funds', value: 'collect-funds' },
					{ name: 'Send Funds', value: 'send-funds' },
					{ name: 'Transfers', value: 'transfers' },
					{ name: 'Wallet', value: 'wallet' },
				],
				description: 'Capabilities to request during onboarding',
			},
			{
				displayName: 'Terms of Service',
				name: 'termsOfService',
				type: 'boolean',
				default: true,
				description: 'Whether to display terms of service',
			},
			{
				displayName: 'Send Email Invite',
				name: 'sendEmailInvite',
				type: 'boolean',
				default: false,
				description: 'Whether to send an email invite with the link',
			},
			{
				displayName: 'Expiration Days',
				name: 'expirationDays',
				type: 'number',
				default: 7,
				description: 'Number of days until the link expires',
			},
		],
	},
];

export async function executeOnboardingOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'createLink': {
			const linkType = this.getNodeParameter('linkType', index) as string;
			const linkOptions = this.getNodeParameter('linkOptions', index, {}) as {
				email?: string;
				redirectUrl?: string;
				capabilities?: string[];
				termsOfService?: boolean;
				sendEmailInvite?: boolean;
				expirationDays?: number;
			};

			const body: any = {
				accountType: linkType,
			};

			if (linkOptions.email) body.email = linkOptions.email;
			if (linkOptions.redirectUrl) body.redirectUrl = linkOptions.redirectUrl;
			if (linkOptions.capabilities?.length) body.capabilities = linkOptions.capabilities;
			if (typeof linkOptions.termsOfService === 'boolean') {
				body.termsOfService = { show: linkOptions.termsOfService };
			}
			if (linkOptions.sendEmailInvite) body.sendEmailInvite = true;
			if (linkOptions.expirationDays) body.expirationDays = linkOptions.expirationDays;

			responseData = await client.post('/onboarding/invites', body);
			break;
		}

		case 'getStatus': {
			const accountId = this.getNodeParameter('accountId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/onboarding`);
			break;
		}

		case 'listInvites': {
			responseData = await client.get('/onboarding/invites');
			break;
		}

		case 'resendInvite': {
			const inviteId = this.getNodeParameter('inviteId', index) as string;
			responseData = await client.post(`/onboarding/invites/${inviteId}/resend`, {});
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
