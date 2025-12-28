/**
 * Moov Node for n8n
 * 
 * Comprehensive payment platform integration for Moov Financial.
 * Supports accounts, transfers, bank accounts, cards, wallets, and more.
 * 
 * @license BSL-1.1
 * @copyright Velocity BPA
 * 
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { MoovClient } from './transport/moovClient';
import type { MoovCredentials } from './utils/authUtils';

// Import operations
import { accountOperations, accountFields, executeAccountOperation } from './actions/account/account.operations';
import { capabilityOperations, capabilityFields, executeCapabilityOperation } from './actions/capability/capability.operations';
import { representativeOperations, representativeFields, executeRepresentativeOperation } from './actions/representative/representative.operations';
import { bankAccountOperations, bankAccountFields, executeBankAccountOperation } from './actions/bankAccount/bankAccount.operations';
import { cardOperations, cardFields, executeCardOperation } from './actions/card/card.operations';
import { walletOperations, walletFields, executeWalletOperation } from './actions/wallet/wallet.operations';
import { paymentMethodOperations, paymentMethodFields, executePaymentMethodOperation } from './actions/paymentMethod/paymentMethod.operations';
import { transferOperations, transferFields, executeTransferOperation } from './actions/transfer/transfer.operations';
import { transferOptionsOperations, transferOptionsFields, executeTransferOptionsOperation } from './actions/transferOptions/transferOptions.operations';
import { refundOperations, refundFields, executeRefundOperation } from './actions/refund/refund.operations';
import { disputeOperations, disputeFields, executeDisputeOperation } from './actions/dispute/dispute.operations';
import { underwritingOperations, underwritingFields, executeUnderwritingOperation } from './actions/underwriting/underwriting.operations';
import { verificationOperations, verificationFields, executeVerificationOperation } from './actions/verification/verification.operations';
import { documentOperations, documentFields, executeDocumentOperation } from './actions/document/document.operations';
import { institutionOperations, institutionFields, executeInstitutionOperation } from './actions/institution/institution.operations';
import { fileOperations, fileFields, executeFileOperation } from './actions/file/file.operations';
import { industryOperations, industryFields, executeIndustryOperation } from './actions/industry/industry.operations';
import { avatarOperations, avatarFields, executeAvatarOperation } from './actions/avatar/avatar.operations';
import { enrichmentOperations, enrichmentFields, executeEnrichmentOperation } from './actions/enrichment/enrichment.operations';
import { analyticsOperations, analyticsFields, executeAnalyticsOperation } from './actions/analytics/analytics.operations';
import { scheduleOperations, scheduleFields, executeScheduleOperation } from './actions/schedule/schedule.operations';
import { webhookOperations, webhookFields, executeWebhookOperation } from './actions/webhook/webhook.operations';
import { eventOperations, eventFields, executeEventOperation } from './actions/event/event.operations';
import { accessTokenOperations, accessTokenFields, executeAccessTokenOperation } from './actions/accessToken/accessToken.operations';
import { onboardingOperations, onboardingFields, executeOnboardingOperation } from './actions/onboarding/onboarding.operations';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility/utility.operations';

export class Moov implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Moov',
		name: 'moov',
		icon: 'file:moov.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Moov payment platform API',
		defaults: {
			name: 'Moov',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'moovApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Access Token', value: 'accessToken' },
					{ name: 'Account', value: 'account' },
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Avatar', value: 'avatar' },
					{ name: 'Bank Account', value: 'bankAccount' },
					{ name: 'Capability', value: 'capability' },
					{ name: 'Card', value: 'card' },
					{ name: 'Dispute', value: 'dispute' },
					{ name: 'Document', value: 'document' },
					{ name: 'Enrichment', value: 'enrichment' },
					{ name: 'Event', value: 'event' },
					{ name: 'File', value: 'file' },
					{ name: 'Industry', value: 'industry' },
					{ name: 'Institution', value: 'institution' },
					{ name: 'Onboarding', value: 'onboarding' },
					{ name: 'Payment Method', value: 'paymentMethod' },
					{ name: 'Refund', value: 'refund' },
					{ name: 'Representative', value: 'representative' },
					{ name: 'Schedule', value: 'schedule' },
					{ name: 'Transfer', value: 'transfer' },
					{ name: 'Transfer Options', value: 'transferOptions' },
					{ name: 'Underwriting', value: 'underwriting' },
					{ name: 'Utility', value: 'utility' },
					{ name: 'Verification', value: 'verification' },
					{ name: 'Wallet', value: 'wallet' },
					{ name: 'Webhook', value: 'webhook' },
				],
				default: 'account',
			},
			// Operations for each resource
			...accountOperations,
			...capabilityOperations,
			...representativeOperations,
			...bankAccountOperations,
			...cardOperations,
			...walletOperations,
			...paymentMethodOperations,
			...transferOperations,
			...transferOptionsOperations,
			...refundOperations,
			...disputeOperations,
			...underwritingOperations,
			...verificationOperations,
			...documentOperations,
			...institutionOperations,
			...fileOperations,
			...industryOperations,
			...avatarOperations,
			...enrichmentOperations,
			...analyticsOperations,
			...scheduleOperations,
			...webhookOperations,
			...eventOperations,
			...accessTokenOperations,
			...onboardingOperations,
			...utilityOperations,
			// Fields for each resource
			...accountFields,
			...capabilityFields,
			...representativeFields,
			...bankAccountFields,
			...cardFields,
			...walletFields,
			...paymentMethodFields,
			...transferFields,
			...transferOptionsFields,
			...refundFields,
			...disputeFields,
			...underwritingFields,
			...verificationFields,
			...documentFields,
			...institutionFields,
			...fileFields,
			...industryFields,
			...avatarFields,
			...enrichmentFields,
			...analyticsFields,
			...scheduleFields,
			...webhookFields,
			...eventFields,
			...accessTokenFields,
			...onboardingFields,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		// Get credentials
		const credentials = await this.getCredentials('moovApi');
		
		// Create client with properly typed credentials
		const moovCredentials: MoovCredentials = {
			accountId: credentials.accountId as string,
			publicKey: credentials.publicKey as string,
			secretKey: credentials.secretKey as string,
			environment: (credentials.environment as string) as 'sandbox' | 'production' | 'custom',
			customApiUrl: credentials.customEndpoint as string | undefined,
		};
		const client = new MoovClient(moovCredentials);

		// Process each item
		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'account':
						result = await executeAccountOperation.call(this, i, client);
						break;
					case 'capability':
						result = await executeCapabilityOperation.call(this, i, client);
						break;
					case 'representative':
						result = await executeRepresentativeOperation.call(this, i, client);
						break;
					case 'bankAccount':
						result = await executeBankAccountOperation.call(this, i, client);
						break;
					case 'card':
						result = await executeCardOperation.call(this, i, client);
						break;
					case 'wallet':
						result = await executeWalletOperation.call(this, i, client);
						break;
					case 'paymentMethod':
						result = await executePaymentMethodOperation.call(this, i, client);
						break;
					case 'transfer':
						result = await executeTransferOperation.call(this, i, client);
						break;
					case 'transferOptions':
						result = await executeTransferOptionsOperation.call(this, i, client);
						break;
					case 'refund':
						result = await executeRefundOperation.call(this, i, client);
						break;
					case 'dispute':
						result = await executeDisputeOperation.call(this, i, client);
						break;
					case 'underwriting':
						result = await executeUnderwritingOperation.call(this, i, client);
						break;
					case 'verification':
						result = await executeVerificationOperation.call(this, i, client);
						break;
					case 'document':
						result = await executeDocumentOperation.call(this, i, client);
						break;
					case 'institution':
						result = await executeInstitutionOperation.call(this, i, client);
						break;
					case 'file':
						result = await executeFileOperation.call(this, i, client);
						break;
					case 'industry':
						result = await executeIndustryOperation.call(this, i, client);
						break;
					case 'avatar':
						result = await executeAvatarOperation.call(this, i, client);
						break;
					case 'enrichment':
						result = await executeEnrichmentOperation.call(this, i, client);
						break;
					case 'analytics':
						result = await executeAnalyticsOperation.call(this, i, client);
						break;
					case 'schedule':
						result = await executeScheduleOperation.call(this, i, client);
						break;
					case 'webhook':
						result = await executeWebhookOperation.call(this, i, client);
						break;
					case 'event':
						result = await executeEventOperation.call(this, i, client);
						break;
					case 'accessToken':
						result = await executeAccessTokenOperation.call(this, i, client);
						break;
					case 'onboarding':
						result = await executeOnboardingOperation.call(this, i, client);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, i, client);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							details: error.response?.data || null,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
