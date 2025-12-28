/**
 * Moov Utility Resource Operations
 * 
 * Utility operations for API status, validation, and configuration.
 * Includes connectivity testing, routing number validation, and reference data.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';
import { validateRoutingNumber } from '../../utils/validationUtils';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Get API Status',
				value: 'getApiStatus',
				description: 'Get Moov API status',
				action: 'Get API status',
			},
			{
				name: 'Get Rate Limits',
				value: 'getRateLimits',
				description: 'Get current rate limit status',
				action: 'Get rate limits',
			},
			{
				name: 'Get Supported Countries',
				value: 'getSupportedCountries',
				description: 'Get list of supported countries',
				action: 'Get supported countries',
			},
			{
				name: 'Get Supported Currencies',
				value: 'getSupportedCurrencies',
				description: 'Get list of supported currencies',
				action: 'Get supported currencies',
			},
			{
				name: 'Test Connection',
				value: 'testConnection',
				description: 'Test API connection',
				action: 'Test connection',
			},
			{
				name: 'Validate Routing Number',
				value: 'validateRoutingNumber',
				description: 'Validate an ABA routing number',
				action: 'Validate routing number',
			},
		],
		default: 'testConnection',
	},
];

export const utilityFields: INodeProperties[] = [
	// Routing Number - for validateRoutingNumber
	{
		displayName: 'Routing Number',
		name: 'routingNumber',
		type: 'string',
		required: true,
		default: '',
		description: 'The 9-digit ABA routing number to validate',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateRoutingNumber'],
			},
		},
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	let responseData: any;

	switch (operation) {
		case 'testConnection': {
			try {
				// Use ping endpoint to test connection
				await client.get('/ping');
				responseData = {
					success: true,
					message: 'Connection successful',
					timestamp: new Date().toISOString(),
				};
			} catch (error: any) {
				responseData = {
					success: false,
					message: error.message || 'Connection failed',
					timestamp: new Date().toISOString(),
				};
			}
			break;
		}

		case 'getApiStatus': {
			try {
				const ping = await client.get('/ping');
				responseData = {
					status: 'operational',
					ping,
					timestamp: new Date().toISOString(),
				};
			} catch (error: any) {
				responseData = {
					status: 'degraded',
					error: error.message,
					timestamp: new Date().toISOString(),
				};
			}
			break;
		}

		case 'validateRoutingNumber': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;

			// Local validation
			const isValid = validateRoutingNumber(routingNumber);

			if (!isValid) {
				responseData = {
					routingNumber,
					valid: false,
					message: 'Invalid routing number format or checksum',
				};
			} else {
				// If format is valid, look up the institution
				try {
					const institution = await client.get(`/institutions/${routingNumber}`);
					responseData = {
						routingNumber,
						valid: true,
						institution,
					};
				} catch {
					responseData = {
						routingNumber,
						valid: true,
						message: 'Routing number format is valid but institution not found',
						institution: null,
					};
				}
			}
			break;
		}

		case 'getSupportedCountries': {
			// Return list of supported countries
			responseData = {
				countries: [
					{ code: 'US', name: 'United States', supported: true },
					{ code: 'CA', name: 'Canada', supported: false, comingSoon: true },
					{ code: 'GB', name: 'United Kingdom', supported: false, comingSoon: true },
				],
				note: 'Currently, Moov primarily supports US-based accounts and transactions',
			};
			break;
		}

		case 'getSupportedCurrencies': {
			// Return list of supported currencies
			responseData = {
				currencies: [
					{ code: 'USD', name: 'US Dollar', symbol: '$', supported: true },
				],
				note: 'Currently, Moov primarily supports USD transactions',
			};
			break;
		}

		case 'getRateLimits': {
			// Rate limit info (Moov returns this in headers)
			responseData = {
				note: 'Rate limit information is returned in API response headers',
				headers: {
					'X-RateLimit-Limit': 'Requests allowed per window',
					'X-RateLimit-Remaining': 'Requests remaining in current window',
					'X-RateLimit-Reset': 'Unix timestamp when window resets',
				},
				defaultLimits: {
					requests_per_second: 100,
					requests_per_minute: 1000,
				},
			};
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
