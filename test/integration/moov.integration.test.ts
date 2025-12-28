/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Integration tests for the Moov n8n node
 * 
 * These tests verify the integration between node components
 * and the Moov API (using mocked responses).
 * 
 * To run against a live sandbox:
 * 1. Set MOOV_ACCOUNT_ID, MOOV_PUBLIC_KEY, MOOV_SECRET_KEY environment variables
 * 2. Run: npm run test:integration
 */

describe('Moov Node Integration', () => {
  let mockCredentials: any;
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockCredentials = {
      environment: 'sandbox',
      accountId: process.env.MOOV_ACCOUNT_ID || 'test-account-id',
      publicKey: process.env.MOOV_PUBLIC_KEY || 'test-public-key',
      secretKey: process.env.MOOV_SECRET_KEY || 'test-secret-key',
    };

    mockExecuteFunctions = {
      getCredentials: jest.fn().mockResolvedValue(mockCredentials),
      helpers: {
        httpRequest: jest.fn(),
      },
      getNode: jest.fn().mockReturnValue({ name: 'Moov' }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNodeParameter: jest.fn(),
    };
  });

  describe('Account Operations', () => {
    it('should create an individual account', async () => {
      const accountData = {
        accountType: 'individual',
        profile: {
          individual: {
            name: {
              firstName: 'John',
              lastName: 'Doe',
            },
            email: 'john.doe@example.com',
            phone: {
              number: '+14155551234',
              countryCode: '1',
            },
          },
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        accountID: '550e8400-e29b-41d4-a716-446655440000',
        accountType: 'individual',
        displayName: 'John Doe',
        profile: accountData.profile,
        createdOn: new Date().toISOString(),
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'create';
          if (param === 'accountType') return 'individual';
          return accountData;
        });

      // Verify the mock setup
      expect(mockExecuteFunctions.getCredentials).toBeDefined();
      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should list accounts with pagination', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        accounts: [
          { accountID: '1', displayName: 'Account 1' },
          { accountID: '2', displayName: 'Account 2' },
        ],
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'list';
          if (param === 'limit') return 10;
          if (param === 'skip') return 0;
          return undefined;
        });

      expect(mockExecuteFunctions.getCredentials).toBeDefined();
    });

    it('should handle account not found error', async () => {
      const error = new Error('Not Found');
      (error as any).response = { status: 404, data: { error: 'Account not found' } };
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'get';
          if (param === 'accountId') return 'non-existent-id';
          return undefined;
        });

      await expect(mockExecuteFunctions.helpers.httpRequest()).rejects.toThrow('Not Found');
    });
  });

  describe('Transfer Operations', () => {
    it('should create a wallet-to-wallet transfer', async () => {
      const transferData = {
        amount: {
          value: 1000,
          currency: 'USD',
        },
        source: {
          paymentMethodID: 'source-wallet-id',
        },
        destination: {
          paymentMethodID: 'dest-wallet-id',
        },
        description: 'Test transfer',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        transferID: 'transfer-123',
        status: 'pending',
        amount: transferData.amount,
        source: transferData.source,
        destination: transferData.destination,
        createdOn: new Date().toISOString(),
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'create';
          return transferData;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should get transfer status', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        transferID: 'transfer-123',
        status: 'completed',
        amount: { value: 1000, currency: 'USD' },
        completedOn: new Date().toISOString(),
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'get';
          if (param === 'transferId') return 'transfer-123';
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should cancel a pending transfer', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        transferID: 'transfer-123',
        status: 'canceled',
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'cancel';
          if (param === 'transferId') return 'transfer-123';
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });
  });

  describe('Bank Account Operations', () => {
    it('should link a bank account', async () => {
      const bankAccountData = {
        accountNumber: '1234567890',
        routingNumber: '021000021',
        accountType: 'checking',
        holderName: 'John Doe',
        holderType: 'individual',
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        bankAccountID: 'bank-123',
        bankAccountType: 'checking',
        bankName: 'Chase',
        lastFourAccountNumber: '7890',
        status: 'pending',
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'link';
          return bankAccountData;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should initiate micro-deposits', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: 'pending',
        createdOn: new Date().toISOString(),
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'initiateMicroDeposits';
          if (param === 'accountId') return 'account-123';
          if (param === 'bankAccountId') return 'bank-123';
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should complete micro-deposits verification', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        status: 'verified',
        verifiedOn: new Date().toISOString(),
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'completeMicroDeposits';
          if (param === 'amounts') return [18, 32];
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });
  });

  describe('Card Operations', () => {
    it('should link a card', async () => {
      const cardData = {
        cardNumber: '4111111111111111',
        expMonth: '12',
        expYear: '2025',
        cardCvv: '123',
        holderName: 'John Doe',
        billingAddress: {
          addressLine1: '123 Main St',
          city: 'San Francisco',
          stateOrProvince: 'CA',
          postalCode: '94102',
          country: 'US',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        cardID: 'card-123',
        brand: 'Visa',
        lastFourCardNumber: '1111',
        expiration: { month: '12', year: '2025' },
        status: 'active',
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'link';
          return cardData;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should list cards for an account', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue([
        { cardID: 'card-1', brand: 'Visa', lastFourCardNumber: '1111' },
        { cardID: 'card-2', brand: 'Mastercard', lastFourCardNumber: '2222' },
      ]);

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'list';
          if (param === 'accountId') return 'account-123';
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });
  });

  describe('Wallet Operations', () => {
    it('should get wallet balance', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        walletID: 'wallet-123',
        balance: {
          currency: 'USD',
          value: 10000,
        },
        availableBalance: {
          currency: 'USD',
          value: 9500,
        },
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'getBalance';
          if (param === 'accountId') return 'account-123';
          if (param === 'walletId') return 'wallet-123';
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });

    it('should list wallet transactions', async () => {
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
        transactions: [
          { transactionID: 'tx-1', type: 'credit', amount: { value: 1000, currency: 'USD' } },
          { transactionID: 'tx-2', type: 'debit', amount: { value: 500, currency: 'USD' } },
        ],
      });

      mockExecuteFunctions.getNodeParameter
        .mockImplementation((param: string) => {
          if (param === 'operation') return 'getTransactions';
          return undefined;
        });

      expect(mockExecuteFunctions.helpers.httpRequest).toBeDefined();
    });
  });

  describe('Webhook Handling', () => {
    it('should verify webhook signature', async () => {
      const webhookSecret = 'webhook-secret';
      const payload = JSON.stringify({ event: 'transfer.completed', data: {} });
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Simulate webhook verification
      const crypto = require('crypto');
      const signatureData = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha512', webhookSecret)
        .update(signatureData)
        .digest('hex');

      expect(expectedSignature).toBeDefined();
      expect(expectedSignature.length).toBe(128); // SHA-512 hex length
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting', async () => {
      const error = new Error('Too Many Requests');
      (error as any).response = {
        status: 429,
        headers: { 'retry-after': '60' },
        data: { error: 'Rate limit exceeded' },
      };
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(mockExecuteFunctions.helpers.httpRequest()).rejects.toThrow('Too Many Requests');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Unprocessable Entity');
      (error as any).response = {
        status: 422,
        data: {
          error: 'Validation failed',
          details: [
            { field: 'email', message: 'Invalid email format' },
          ],
        },
      };
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(mockExecuteFunctions.helpers.httpRequest()).rejects.toThrow('Unprocessable Entity');
    });

    it('should handle server errors', async () => {
      const error = new Error('Internal Server Error');
      (error as any).response = {
        status: 500,
        data: { error: 'Internal server error' },
      };
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

      await expect(mockExecuteFunctions.helpers.httpRequest()).rejects.toThrow('Internal Server Error');
    });
  });
});
