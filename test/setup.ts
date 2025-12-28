/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Jest setup file
beforeAll(() => {
  // Global test setup
});

afterAll(() => {
  // Global test teardown
});

// Mock n8n-workflow module
jest.mock('n8n-workflow', () => ({
  IExecuteFunctions: jest.fn(),
  INodeExecutionData: jest.fn(),
  INodeType: jest.fn(),
  INodeTypeDescription: jest.fn(),
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: unknown, message: string) {
      super(message);
      this.name = 'NodeOperationError';
    }
  },
  NodeApiError: class NodeApiError extends Error {
    constructor(node: unknown, error: unknown) {
      super(error instanceof Error ? error.message : 'API Error');
      this.name = 'NodeApiError';
    }
  },
}), { virtual: true });
