/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { MoovClient } from '../../nodes/Moov/transport/moovClient';

describe('MoovClient', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getCredentials: jest.fn().mockResolvedValue({
        environment: 'sandbox',
        accountId: 'test-account-id',
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
      }),
      helpers: {
        httpRequest: jest.fn(),
      },
      getNode: jest.fn().mockReturnValue({ name: 'Moov' }),
    };
  });

  describe('constructor', () => {
    it('should create a MoovClient instance', () => {
      const client = new MoovClient(mockExecuteFunctions);
      expect(client).toBeInstanceOf(MoovClient);
    });
  });

  describe('getBaseUrl', () => {
    it('should return sandbox URL for sandbox environment', async () => {
      mockExecuteFunctions.getCredentials.mockResolvedValue({
        environment: 'sandbox',
        accountId: 'test-account-id',
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
      });

      const client = new MoovClient(mockExecuteFunctions);
      await client.initialize();

      expect(client.getBaseUrl()).toBe('https://api.moov.io');
    });

    it('should return production URL for production environment', async () => {
      mockExecuteFunctions.getCredentials.mockResolvedValue({
        environment: 'production',
        accountId: 'test-account-id',
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
      });

      const client = new MoovClient(mockExecuteFunctions);
      await client.initialize();

      expect(client.getBaseUrl()).toBe('https://api.moov.io');
    });
  });

  describe('request', () => {
    it('should make a GET request', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ data: 'test' });

      const client = new MoovClient(mockExecuteFunctions);
      await client.initialize();

      const result = await client.request('GET', '/accounts');

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: expect.stringContaining('/accounts'),
        })
      );
    });

    it('should make a POST request with body', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ accountID: '123' });

      const client = new MoovClient(mockExecuteFunctions);
      await client.initialize();

      const body = { accountType: 'individual', profile: { individual: { name: { firstName: 'John', lastName: 'Doe' } } } };
      const result = await client.request('POST', '/accounts', body);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining(body),
        })
      );
    });

    it('should handle query parameters', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({ accounts: [] });

      const client = new MoovClient(mockExecuteFunctions);
      await client.initialize();

      await client.request('GET', '/accounts', undefined, { limit: 10, skip: 0 });

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          qs: expect.objectContaining({ limit: 10, skip: 0 }),
        })
      );
    });
  });
});

describe('MoovClient Error Handling', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getCredentials: jest.fn().mockResolvedValue({
        environment: 'sandbox',
        accountId: 'test-account-id',
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
      }),
      helpers: {
        httpRequest: jest.fn(),
      },
      getNode: jest.fn().mockReturnValue({ name: 'Moov' }),
    };
  });

  it('should handle API errors', async () => {
    const apiError = new Error('API Error');
    (apiError as any).response = {
      status: 400,
      data: { error: 'Bad Request' },
    };
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(apiError);

    const client = new MoovClient(mockExecuteFunctions);
    await client.initialize();

    await expect(client.request('GET', '/accounts')).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network Error'));

    const client = new MoovClient(mockExecuteFunctions);
    await client.initialize();

    await expect(client.request('GET', '/accounts')).rejects.toThrow('Network Error');
  });

  it('should handle authentication errors', async () => {
    const authError = new Error('Unauthorized');
    (authError as any).response = {
      status: 401,
      data: { error: 'Invalid credentials' },
    };
    mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(authError);

    const client = new MoovClient(mockExecuteFunctions);
    await client.initialize();

    await expect(client.request('GET', '/accounts')).rejects.toThrow();
  });
});
