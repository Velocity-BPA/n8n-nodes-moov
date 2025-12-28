/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Moov API Credentials
 *
 * Provides authentication for the Moov payment platform API.
 * Supports Production, Sandbox, and Custom environments.
 *
 * @see https://docs.moov.io/guides/get-started/authentication/
 */
export class MoovApi implements ICredentialType {
  name = 'moovApi';
  displayName = 'Moov API';
  documentationUrl = 'https://docs.moov.io/guides/get-started/authentication/';

  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      default: 'sandbox',
      options: [
        {
          name: 'Production',
          value: 'production',
          description: 'Moov Production Environment',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
          description: 'Moov Sandbox Environment for testing',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom API endpoint',
        },
      ],
      description: 'Select the Moov environment to connect to',
    },
    {
      displayName: 'Custom API URL',
      name: 'customApiUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api.example.com',
      description: 'Custom API endpoint URL',
      displayOptions: {
        show: {
          environment: ['custom'],
        },
      },
    },
    {
      displayName: 'Account ID (Facilitator)',
      name: 'accountId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Moov facilitator account ID. This is your platform account that manages connected accounts.',
    },
    {
      displayName: 'Public Key',
      name: 'publicKey',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Moov API public key',
    },
    {
      displayName: 'Secret Key',
      name: 'secretKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Moov API secret key. Keep this secure and never expose it.',
    },
    {
      displayName: 'Webhook Secret',
      name: 'webhookSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Secret key for verifying webhook signatures (optional)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization:
          '=Basic {{Buffer.from($credentials.publicKey + ":" + $credentials.secretKey).toString("base64")}}',
        'X-Account-ID': '={{$credentials.accountId}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.environment === "production" ? "https://api.moov.io" : $credentials.environment === "sandbox" ? "https://api.sandbox.moov.io" : $credentials.customApiUrl}}',
      url: '/accounts/{{$credentials.accountId}}',
      method: 'GET',
    },
  };
}
