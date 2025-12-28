/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ICredentialType,
  INodeProperties,
  ICredentialDataDecryptedObject,
  IHttpRequestOptions,
} from 'n8n-workflow';

/**
 * Moov OAuth Credentials
 *
 * Provides OAuth 2.0 authentication for the Moov payment platform.
 * Use this for scoped access to specific account resources.
 *
 * @see https://docs.moov.io/guides/get-started/authentication/
 */
export class MoovOAuth implements ICredentialType {
  name = 'moovOAuth';
  displayName = 'Moov OAuth';
  documentationUrl = 'https://docs.moov.io/guides/get-started/authentication/';
  extends = ['oAuth2Api'];

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
      ],
      description: 'Select the Moov environment to connect to',
    },
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'clientCredentials',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Moov OAuth Client ID',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Moov OAuth Client Secret',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: '/accounts.read /accounts.write /transfers.read /transfers.write',
      description: 'Space-separated list of OAuth scopes to request',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default:
        '={{$self.environment === "production" ? "https://api.moov.io/oauth2/authorize" : "https://api.sandbox.moov.io/oauth2/authorize"}}',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default:
        '={{$self.environment === "production" ? "https://api.moov.io/oauth2/token" : "https://api.sandbox.moov.io/oauth2/token"}}',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header',
    },
  ];
}
