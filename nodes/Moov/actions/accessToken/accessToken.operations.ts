/**
 * Moov Access Token Resource Operations
 * 
 * Access tokens provide scoped authentication for API operations.
 * Create, manage, and revoke tokens with specific scopes.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';

export const accessTokenOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['accessToken'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new access token',
				action: 'Create access token',
			},
			{
				name: 'Get Scopes',
				value: 'getScopes',
				description: 'Get available scopes',
				action: 'Get token scopes',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List active access tokens',
				action: 'List access tokens',
			},
			{
				name: 'Revoke',
				value: 'revoke',
				description: 'Revoke an access token',
				action: 'Revoke access token',
			},
		],
		default: 'create',
	},
];

export const accessTokenFields: INodeProperties[] = [
	// Scopes - for create
	{
		displayName: 'Scopes',
		name: 'scopes',
		type: 'multiOptions',
		required: true,
		default: [],
		options: [
			{ name: 'Accounts Read', value: '/accounts.read' },
			{ name: 'Accounts Write', value: '/accounts.write' },
			{ name: 'Bank Accounts Read', value: '/accounts/{accountID}/bank-accounts.read' },
			{ name: 'Bank Accounts Write', value: '/accounts/{accountID}/bank-accounts.write' },
			{ name: 'Cards Read', value: '/accounts/{accountID}/cards.read' },
			{ name: 'Cards Write', value: '/accounts/{accountID}/cards.write' },
			{ name: 'Capabilities Read', value: '/accounts/{accountID}/capabilities.read' },
			{ name: 'Capabilities Write', value: '/accounts/{accountID}/capabilities.write' },
			{ name: 'Transfers Read', value: '/accounts/{accountID}/transfers.read' },
			{ name: 'Transfers Write', value: '/accounts/{accountID}/transfers.write' },
			{ name: 'Wallets Read', value: '/accounts/{accountID}/wallets.read' },
			{ name: 'Fed Read', value: '/fed.read' },
			{ name: 'Ping', value: '/ping.read' },
		],
		description: 'OAuth scopes for the token',
		displayOptions: {
			show: {
				resource: ['accessToken'],
				operation: ['create'],
			},
		},
	},
	// Account ID - for scoped tokens
	{
		displayName: 'Account ID (for scoped access)',
		name: 'accountId',
		type: 'string',
		default: '',
		description: 'Account ID to scope the token to (replaces {accountID} in scopes)',
		displayOptions: {
			show: {
				resource: ['accessToken'],
				operation: ['create'],
			},
		},
	},
	// Token - for revoke
	{
		displayName: 'Token',
		name: 'token',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: true,
		default: '',
		description: 'The access token to revoke',
		displayOptions: {
			show: {
				resource: ['accessToken'],
				operation: ['revoke'],
			},
		},
	},
	// Token Options
	{
		displayName: 'Token Options',
		name: 'tokenOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['accessToken'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Expires In (seconds)',
				name: 'expiresIn',
				type: 'number',
				default: 3600,
				description: 'Token lifetime in seconds',
			},
		],
	},
];

export async function executeAccessTokenOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'create': {
			const scopes = this.getNodeParameter('scopes', index) as string[];
			const accountId = this.getNodeParameter('accountId', index, '') as string;
			const tokenOptions = this.getNodeParameter('tokenOptions', index, {}) as {
				expiresIn?: number;
			};

			// Replace {accountID} placeholder with actual account ID if provided
			const finalScopes = accountId
				? scopes.map(scope => scope.replace('{accountID}', accountId))
				: scopes;

			const body: any = {
				grant_type: 'client_credentials',
				scope: finalScopes.join(' '),
			};

			// OAuth token endpoint
			responseData = await client.post('/oauth2/token', body, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			// Add expiration info to response
			if (tokenOptions.expiresIn) {
				responseData.requested_expires_in = tokenOptions.expiresIn;
			}
			break;
		}

		case 'revoke': {
			const token = this.getNodeParameter('token', index) as string;
			responseData = await client.post('/oauth2/revoke', {
				token,
				token_type_hint: 'access_token',
			}, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			break;
		}

		case 'list': {
			// Note: Moov may not have a direct list endpoint, this returns current credentials info
			responseData = await client.get('/accounts');
			break;
		}

		case 'getScopes': {
			// Return available scope definitions
			responseData = {
				scopes: [
					{ scope: '/accounts.read', description: 'Read account information' },
					{ scope: '/accounts.write', description: 'Create and update accounts' },
					{ scope: '/accounts/{accountID}/bank-accounts.read', description: 'Read bank accounts' },
					{ scope: '/accounts/{accountID}/bank-accounts.write', description: 'Link and manage bank accounts' },
					{ scope: '/accounts/{accountID}/cards.read', description: 'Read card information' },
					{ scope: '/accounts/{accountID}/cards.write', description: 'Link and manage cards' },
					{ scope: '/accounts/{accountID}/capabilities.read', description: 'Read account capabilities' },
					{ scope: '/accounts/{accountID}/capabilities.write', description: 'Request and manage capabilities' },
					{ scope: '/accounts/{accountID}/transfers.read', description: 'Read transfer information' },
					{ scope: '/accounts/{accountID}/transfers.write', description: 'Create and manage transfers' },
					{ scope: '/accounts/{accountID}/wallets.read', description: 'Read wallet information' },
					{ scope: '/fed.read', description: 'Search financial institutions' },
					{ scope: '/ping.read', description: 'Test API connectivity' },
				],
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
