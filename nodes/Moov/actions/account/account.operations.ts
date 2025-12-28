/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { moovApiRequest } from '../../transport/moovClient';
import type { MoovClient } from '../../transport/moovClient';
import { RESOURCE_PATHS } from '../../constants/endpoints';
import { ACCOUNT_TYPE_OPTIONS, BUSINESS_TYPE_OPTIONS } from '../../constants';

/**
 * Account Resource Operations
 *
 * Accounts in Moov represent either individuals or businesses.
 * The facilitator account is your platform account that manages connected accounts.
 */

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new account',
        action: 'Create an account',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get an account by ID',
        action: 'Get an account',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update an account',
        action: 'Update an account',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all accounts',
        action: 'List accounts',
      },
      {
        name: 'Get Capabilities',
        value: 'getCapabilities',
        description: 'Get account capabilities',
        action: 'Get account capabilities',
      },
      {
        name: 'Request Capability',
        value: 'requestCapability',
        description: 'Request a capability for an account',
        action: 'Request capability',
      },
      {
        name: 'Disable Capability',
        value: 'disableCapability',
        description: 'Disable a capability for an account',
        action: 'Disable capability',
      },
      {
        name: 'Get Terms of Service Token',
        value: 'getTosToken',
        description: 'Get a terms of service acceptance token',
        action: 'Get TOS token',
      },
      {
        name: 'Accept Terms of Service',
        value: 'acceptTos',
        description: 'Accept terms of service for an account',
        action: 'Accept TOS',
      },
      {
        name: 'Get Countries',
        value: 'getCountries',
        description: 'Get countries assigned to an account',
        action: 'Get account countries',
      },
      {
        name: 'Assign Countries',
        value: 'assignCountries',
        description: 'Assign countries to an account',
        action: 'Assign countries',
      },
    ],
    default: 'get',
  },
];

export const accountFields: INodeProperties[] = [
  // Account ID for most operations
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    description: 'The unique identifier for the account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: [
          'get',
          'update',
          'getCapabilities',
          'requestCapability',
          'disableCapability',
          'getTosToken',
          'acceptTos',
          'getCountries',
          'assignCountries',
        ],
      },
    },
  },

  // Create Account Fields
  {
    displayName: 'Account Type',
    name: 'accountType',
    type: 'options',
    required: true,
    default: 'individual',
    options: ACCOUNT_TYPE_OPTIONS,
    description: 'The type of account to create',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create'],
      },
    },
  },

  // Individual Profile Fields
  {
    displayName: 'Individual Profile',
    name: 'individualProfile',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create', 'update'],
        accountType: ['individual'],
      },
    },
    options: [
      {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        default: '',
        description: 'Legal first name',
      },
      {
        displayName: 'Middle Name',
        name: 'middleName',
        type: 'string',
        default: '',
        description: 'Legal middle name',
      },
      {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        default: '',
        description: 'Legal last name',
      },
      {
        displayName: 'Suffix',
        name: 'suffix',
        type: 'string',
        default: '',
        description: 'Name suffix (e.g., Jr., Sr., III)',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        description: 'Email address',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Phone number in E.164 format',
      },
      {
        displayName: 'Birth Date',
        name: 'birthDate',
        type: 'string',
        default: '',
        description: 'Date of birth (YYYY-MM-DD)',
      },
      {
        displayName: 'SSN Last Four',
        name: 'ssnLastFour',
        type: 'string',
        default: '',
        description: 'Last 4 digits of SSN',
      },
      {
        displayName: 'Full SSN',
        name: 'ssn',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Full SSN (9 digits, used for verification)',
      },
    ],
  },

  // Individual Address
  {
    displayName: 'Individual Address',
    name: 'individualAddress',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create', 'update'],
        accountType: ['individual'],
      },
    },
    options: [
      {
        displayName: 'Address Line 1',
        name: 'addressLine1',
        type: 'string',
        default: '',
        description: 'Street address',
      },
      {
        displayName: 'Address Line 2',
        name: 'addressLine2',
        type: 'string',
        default: '',
        description: 'Apartment, suite, unit, etc.',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'City name',
      },
      {
        displayName: 'State',
        name: 'stateOrProvince',
        type: 'string',
        default: '',
        description: 'State or province (2-letter code)',
      },
      {
        displayName: 'Postal Code',
        name: 'postalCode',
        type: 'string',
        default: '',
        description: 'ZIP or postal code',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: 'US',
        description: 'Country code (ISO 3166-1 alpha-2)',
      },
    ],
  },

  // Business Profile Fields
  {
    displayName: 'Business Profile',
    name: 'businessProfile',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create', 'update'],
        accountType: ['business'],
      },
    },
    options: [
      {
        displayName: 'Legal Business Name',
        name: 'legalBusinessName',
        type: 'string',
        default: '',
        description: 'Legal name of the business',
      },
      {
        displayName: 'DBA Name',
        name: 'doingBusinessAs',
        type: 'string',
        default: '',
        description: 'Doing business as name',
      },
      {
        displayName: 'Business Type',
        name: 'businessType',
        type: 'options',
        options: BUSINESS_TYPE_OPTIONS,
        default: 'llc',
        description: 'Type of business entity',
      },
      {
        displayName: 'EIN',
        name: 'ein',
        type: 'string',
        default: '',
        description: 'Employer Identification Number',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        placeholder: 'name@email.com',
        default: '',
        description: 'Business email address',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Business phone number',
      },
      {
        displayName: 'Website',
        name: 'website',
        type: 'string',
        default: '',
        description: 'Business website URL',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        default: '',
        description: 'Description of the business',
      },
      {
        displayName: 'Industry Codes',
        name: 'industryCodes',
        type: 'string',
        default: '',
        description: 'Comma-separated MCC codes',
      },
    ],
  },

  // Business Address
  {
    displayName: 'Business Address',
    name: 'businessAddress',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create', 'update'],
        accountType: ['business'],
      },
    },
    options: [
      {
        displayName: 'Address Line 1',
        name: 'addressLine1',
        type: 'string',
        default: '',
        description: 'Street address',
      },
      {
        displayName: 'Address Line 2',
        name: 'addressLine2',
        type: 'string',
        default: '',
        description: 'Suite, floor, etc.',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'City name',
      },
      {
        displayName: 'State',
        name: 'stateOrProvince',
        type: 'string',
        default: '',
        description: 'State or province (2-letter code)',
      },
      {
        displayName: 'Postal Code',
        name: 'postalCode',
        type: 'string',
        default: '',
        description: 'ZIP or postal code',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: 'US',
        description: 'Country code (ISO 3166-1 alpha-2)',
      },
    ],
  },

  // Capability fields
  {
    displayName: 'Capability',
    name: 'capability',
    type: 'options',
    required: true,
    default: 'transfers',
    options: [
      { name: 'Transfers', value: 'transfers' },
      { name: 'Send Funds', value: 'send-funds' },
      { name: 'Collect Funds', value: 'collect-funds' },
      { name: 'Wallet', value: 'wallet' },
      { name: 'Card Issuing', value: 'card-issuing' },
    ],
    description: 'The capability to request or disable',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['requestCapability', 'disableCapability'],
      },
    },
  },

  // Terms of Service fields
  {
    displayName: 'TOS Token',
    name: 'tosToken',
    type: 'string',
    required: true,
    default: '',
    description: 'The terms of service token to accept',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['acceptTos'],
      },
    },
  },

  // Countries field
  {
    displayName: 'Countries',
    name: 'countries',
    type: 'string',
    required: true,
    default: 'US',
    description: 'Comma-separated list of country codes (ISO 3166-1 alpha-2)',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['assignCountries'],
      },
    },
  },

  // List options
  {
    displayName: 'Options',
    name: 'listOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Filter by account name',
      },
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Filter by email address',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          ...ACCOUNT_TYPE_OPTIONS,
        ],
        default: '',
        description: 'Filter by account type',
      },
      {
        displayName: 'Count',
        name: 'count',
        type: 'number',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        default: 20,
        description: 'Number of results to return',
      },
      {
        displayName: 'Skip',
        name: 'skip',
        type: 'number',
        typeOptions: {
          minValue: 0,
        },
        default: 0,
        description: 'Number of results to skip',
      },
    ],
  },

  // Foreign ID for external tracking
  {
    displayName: 'Foreign ID',
    name: 'foreignId',
    type: 'string',
    default: '',
    description: 'External ID for tracking in your system',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create', 'update'],
      },
    },
  },

  // Metadata
  {
    displayName: 'Metadata',
    name: 'metadata',
    type: 'json',
    default: '{}',
    description: 'Custom metadata to attach to the account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create', 'update'],
      },
    },
  },
];

/**
 * Execute account operations
 */
export async function executeAccountOperation(
  this: IExecuteFunctions,
  index: number,
  _client: MoovClient,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  let responseData: unknown;

  switch (operation) {
    case 'create': {
      const accountType = this.getNodeParameter('accountType', index) as string;
      const foreignId = this.getNodeParameter('foreignId', index, '') as string;
      const metadata = this.getNodeParameter('metadata', index, '{}') as string;

      const body: Record<string, unknown> = {
        accountType,
      };

      if (accountType === 'individual') {
        const profile = this.getNodeParameter('individualProfile', index, {}) as Record<string, unknown>;
        const address = this.getNodeParameter('individualAddress', index, {}) as Record<string, unknown>;

        if (Object.keys(profile).length > 0) {
          body.profile = {
            individual: {
              name: {
                firstName: profile.firstName,
                middleName: profile.middleName,
                lastName: profile.lastName,
                suffix: profile.suffix,
              },
              email: profile.email,
              phone: profile.phone ? { number: profile.phone } : undefined,
              birthDate: profile.birthDate ? { 
                day: parseInt((profile.birthDate as string).split('-')[2]), 
                month: parseInt((profile.birthDate as string).split('-')[1]), 
                year: parseInt((profile.birthDate as string).split('-')[0]) 
              } : undefined,
              governmentID: profile.ssn ? { ssn: { full: profile.ssn } } : profile.ssnLastFour ? { ssn: { lastFour: profile.ssnLastFour } } : undefined,
            },
          };
        }

        if (Object.keys(address).length > 0) {
          (body.profile as Record<string, unknown>).individual = {
            ...((body.profile as Record<string, unknown>).individual as Record<string, unknown>),
            address,
          };
        }
      } else {
        const profile = this.getNodeParameter('businessProfile', index, {}) as Record<string, unknown>;
        const address = this.getNodeParameter('businessAddress', index, {}) as Record<string, unknown>;

        if (Object.keys(profile).length > 0) {
          body.profile = {
            business: {
              legalBusinessName: profile.legalBusinessName,
              doingBusinessAs: profile.doingBusinessAs,
              businessType: profile.businessType,
              ein: profile.ein ? { number: profile.ein } : undefined,
              email: profile.email,
              phone: profile.phone ? { number: profile.phone } : undefined,
              website: profile.website,
              description: profile.description,
              industryCodes: profile.industryCodes
                ? { mcc: (profile.industryCodes as string).split(',').map((c) => c.trim()) }
                : undefined,
            },
          };
        }

        if (Object.keys(address).length > 0) {
          (body.profile as Record<string, unknown>).business = {
            ...((body.profile as Record<string, unknown>).business as Record<string, unknown>),
            address,
          };
        }
      }

      if (foreignId) {
        body.foreignId = foreignId;
      }

      if (metadata && metadata !== '{}') {
        body.metadata = JSON.parse(metadata);
      }

      responseData = await moovApiRequest.call(this, {
        method: 'POST',
        endpoint: RESOURCE_PATHS.ACCOUNTS,
        body,
      });
      break;
    }

    case 'get': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'GET',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}`,
      });
      break;
    }

    case 'update': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      const accountType = this.getNodeParameter('accountType', index, 'individual') as string;
      const foreignId = this.getNodeParameter('foreignId', index, '') as string;
      const metadata = this.getNodeParameter('metadata', index, '{}') as string;

      const body: Record<string, unknown> = {};

      if (accountType === 'individual') {
        const profile = this.getNodeParameter('individualProfile', index, {}) as Record<string, unknown>;
        const address = this.getNodeParameter('individualAddress', index, {}) as Record<string, unknown>;

        if (Object.keys(profile).length > 0 || Object.keys(address).length > 0) {
          body.profile = { individual: {} };
          if (Object.keys(profile).length > 0) {
            (body.profile as Record<string, unknown>).individual = profile;
          }
          if (Object.keys(address).length > 0) {
            ((body.profile as Record<string, unknown>).individual as Record<string, unknown>).address = address;
          }
        }
      } else {
        const profile = this.getNodeParameter('businessProfile', index, {}) as Record<string, unknown>;
        const address = this.getNodeParameter('businessAddress', index, {}) as Record<string, unknown>;

        if (Object.keys(profile).length > 0 || Object.keys(address).length > 0) {
          body.profile = { business: {} };
          if (Object.keys(profile).length > 0) {
            (body.profile as Record<string, unknown>).business = profile;
          }
          if (Object.keys(address).length > 0) {
            ((body.profile as Record<string, unknown>).business as Record<string, unknown>).address = address;
          }
        }
      }

      if (foreignId) {
        body.foreignId = foreignId;
      }

      if (metadata && metadata !== '{}') {
        body.metadata = JSON.parse(metadata);
      }

      responseData = await moovApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}`,
        body,
      });
      break;
    }

    case 'list': {
      const options = this.getNodeParameter('listOptions', index, {}) as Record<string, unknown>;
      responseData = await moovApiRequest.call(this, {
        method: 'GET',
        endpoint: RESOURCE_PATHS.ACCOUNTS,
        query: {
          name: options.name as string,
          email: options.email as string,
          type: options.type as string,
          count: options.count as number,
          skip: options.skip as number,
        },
      });
      break;
    }

    case 'getCapabilities': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'GET',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.CAPABILITIES}`,
      });
      break;
    }

    case 'requestCapability': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      const capability = this.getNodeParameter('capability', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'POST',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.CAPABILITIES}`,
        body: {
          capabilities: [capability],
        },
      });
      break;
    }

    case 'disableCapability': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      const capability = this.getNodeParameter('capability', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'DELETE',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.CAPABILITIES}/${capability}`,
      });
      break;
    }

    case 'getTosToken': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'GET',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.TERMS_OF_SERVICE}/token`,
      });
      break;
    }

    case 'acceptTos': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      const tosToken = this.getNodeParameter('tosToken', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'POST',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.TERMS_OF_SERVICE}`,
        body: {
          token: tosToken,
        },
      });
      break;
    }

    case 'getCountries': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'GET',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.COUNTRIES}`,
      });
      break;
    }

    case 'assignCountries': {
      const accountId = this.getNodeParameter('accountId', index) as string;
      const countries = this.getNodeParameter('countries', index) as string;
      responseData = await moovApiRequest.call(this, {
        method: 'PUT',
        endpoint: `${RESOURCE_PATHS.ACCOUNTS}/${accountId}${RESOURCE_PATHS.COUNTRIES}`,
        body: {
          countries: countries.split(',').map((c) => c.trim()),
        },
      });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return [{ json: responseData as IDataObject }];
}
