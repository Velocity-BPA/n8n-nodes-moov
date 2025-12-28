/**
 * Moov Card Resource Operations
 * 
 * Cards are payment methods for card-based transfers. Supports credit, debit,
 * and prepaid cards. Includes Apple Pay domain registration.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from '../../transport/moovClient';
import { CARD_BRANDS, CARD_TYPES } from '../../constants/transferTypes';

export const cardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['card'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a card from an account',
				action: 'Delete a card',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific card',
				action: 'Get a card',
			},
			{
				name: 'Get Apple Pay Domains',
				value: 'getApplePayDomains',
				description: 'Get registered Apple Pay domains',
				action: 'Get Apple Pay domains',
			},
			{
				name: 'Link',
				value: 'link',
				description: 'Link a card to an account',
				action: 'Link a card',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all cards for an account',
				action: 'List cards',
			},
			{
				name: 'Register Apple Pay Domain',
				value: 'registerApplePayDomain',
				description: 'Register a domain for Apple Pay',
				action: 'Register Apple Pay domain',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a card',
				action: 'Update a card',
			},
		],
		default: 'list',
	},
];

export const cardFields: INodeProperties[] = [
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
				resource: ['card'],
			},
		},
	},
	// Card ID - for get, update, delete
	{
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		required: true,
		default: '',
		description: 'The unique identifier of the card',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	// Link card fields
	{
		displayName: 'Card Number',
		name: 'cardNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '4111111111111111',
		description: 'The full card number (PAN)',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Expiration Month',
		name: 'expMonth',
		type: 'string',
		required: true,
		default: '',
		placeholder: '12',
		description: 'Card expiration month (MM format)',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Expiration Year',
		name: 'expYear',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2025',
		description: 'Card expiration year (YYYY format)',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'CVV',
		name: 'cardCvv',
		type: 'string',
		required: true,
		default: '',
		placeholder: '123',
		description: 'Card verification value (3-4 digits)',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['link'],
			},
		},
	},
	{
		displayName: 'Cardholder Name',
		name: 'holderName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name as it appears on the card',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['link'],
			},
		},
	},
	// Apple Pay domain
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'pay.example.com',
		description: 'Domain to register for Apple Pay',
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['registerApplePayDomain'],
			},
		},
	},
	// Billing address for link
	{
		displayName: 'Billing Address',
		name: 'billingAddress',
		type: 'collection',
		placeholder: 'Add Billing Address',
		default: {},
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['link', 'update'],
			},
		},
		options: [
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
				description: 'Two-letter country code',
			},
		],
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['card'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Expiration Month',
				name: 'expMonth',
				type: 'string',
				default: '',
				placeholder: '12',
				description: 'New expiration month',
			},
			{
				displayName: 'Expiration Year',
				name: 'expYear',
				type: 'string',
				default: '',
				placeholder: '2026',
				description: 'New expiration year',
			},
		],
	},
];

export async function executeCardOperation(
	this: IExecuteFunctions,
	index: number,
	client: MoovClient,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const accountId = this.getNodeParameter('accountId', index) as string;

	let responseData: any;

	switch (operation) {
		case 'list': {
			responseData = await client.get(`/accounts/${accountId}/cards`);
			break;
		}

		case 'get': {
			const cardId = this.getNodeParameter('cardId', index) as string;
			responseData = await client.get(`/accounts/${accountId}/cards/${cardId}`);
			break;
		}

		case 'link': {
			const cardNumber = this.getNodeParameter('cardNumber', index) as string;
			const expMonth = this.getNodeParameter('expMonth', index) as string;
			const expYear = this.getNodeParameter('expYear', index) as string;
			const cardCvv = this.getNodeParameter('cardCvv', index) as string;
			const holderName = this.getNodeParameter('holderName', index) as string;
			const billingAddress = this.getNodeParameter('billingAddress', index) as any;

			const body: any = {
				cardNumber,
				expiration: {
					month: expMonth,
					year: expYear,
				},
				cardCvv,
				holderName,
			};

			if (billingAddress && Object.keys(billingAddress).length > 0) {
				body.billingAddress = billingAddress;
			}

			responseData = await client.post(`/accounts/${accountId}/cards`, body);
			break;
		}

		case 'update': {
			const cardId = this.getNodeParameter('cardId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index) as any;
			const billingAddress = this.getNodeParameter('billingAddress', index) as any;

			const body: any = {};

			if (updateFields.expMonth || updateFields.expYear) {
				body.expiration = {};
				if (updateFields.expMonth) body.expiration.month = updateFields.expMonth;
				if (updateFields.expYear) body.expiration.year = updateFields.expYear;
			}

			if (billingAddress && Object.keys(billingAddress).length > 0) {
				body.billingAddress = billingAddress;
			}

			responseData = await client.patch(`/accounts/${accountId}/cards/${cardId}`, body);
			break;
		}

		case 'delete': {
			const cardId = this.getNodeParameter('cardId', index) as string;
			await client.delete(`/accounts/${accountId}/cards/${cardId}`);
			responseData = { success: true, cardId };
			break;
		}

		case 'registerApplePayDomain': {
			const domain = this.getNodeParameter('domain', index) as string;
			responseData = await client.post(`/accounts/${accountId}/apple-pay/domains`, {
				displayName: domain,
			});
			break;
		}

		case 'getApplePayDomains': {
			responseData = await client.get(`/accounts/${accountId}/apple-pay/domains`);
			break;
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}
