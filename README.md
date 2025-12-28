# n8n-nodes-moov

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Moov payment platform, providing seamless integration with Moov's payment infrastructure for account management, transfers, bank accounts, cards, wallets, and more.

![n8n Node](https://img.shields.io/badge/n8n-community--node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Moov API](https://img.shields.io/badge/Moov%20API-v1-green)

## Features

- **26 Resource Categories** - Complete coverage of Moov's payment API
- **150+ Operations** - Full CRUD operations across all resources
- **Real-time Webhooks** - MoovTrigger node for event-driven workflows
- **Multi-Environment** - Production and Sandbox support
- **OAuth 2.0** - Secure authentication with scoped access tokens
- **TypeScript** - Full type safety and IntelliSense support

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-moov`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-moov

# Restart n8n
```

### Development Installation

```bash
# Clone and build
git clone https://github.com/Velocity-BPA/n8n-nodes-moov.git
cd n8n-nodes-moov
npm install
npm run build

# Create symlink
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-moov

# Restart n8n
n8n start
```

## Credentials Setup

### Moov API Credentials

| Field | Description |
|-------|-------------|
| Environment | `Production` or `Sandbox` |
| Account ID | Your Moov Facilitator Account ID |
| Public Key | API public key from Moov Dashboard |
| Secret Key | API secret key from Moov Dashboard |
| Webhook Secret | (Optional) Secret for webhook signature verification |

### Moov OAuth Credentials

| Field | Description |
|-------|-------------|
| Client ID | OAuth client ID |
| Client Secret | OAuth client secret |
| Scopes | Comma-separated list of OAuth scopes |

## Resources & Operations

### Account
Manage Moov accounts (individuals and businesses)
- Create, Get, Update, List accounts
- Get/Request/Disable capabilities
- Terms of Service management
- Country assignments

### Capability
Control account capabilities
- Get capabilities and requirements
- Request new capabilities
- Check capability status

### Representative
Manage business representatives (for business accounts)
- Create, Get, Update, Delete representatives
- List all representatives

### Bank Account
Link and manage bank accounts
- Link bank accounts
- Initiate/Complete micro-deposit verification
- Get instant verification links
- Delete bank accounts

### Card
Link and manage payment cards
- Link cards (credit/debit)
- Update card details
- Apple Pay domain registration
- Get card brand information

### Wallet
Manage Moov wallets
- Get wallet details and balance
- List wallets
- Get wallet transactions

### Payment Method
View available payment methods
- Get payment method details
- List payment methods by account

### Transfer
Move money between accounts
- Create transfers (ACH, card, wallet)
- Get transfer details and options
- Cancel, refund, reverse transfers
- Patch transfer metadata

### Transfer Options
Explore available transfer methods
- Get source/destination options
- Check available payment rails

### Refund
Process refunds
- Create full/partial refunds
- Track refund status

### Dispute
Handle payment disputes
- List and get disputes
- Accept disputes
- Submit/Upload/Delete evidence

### Underwriting
Manage risk assessment
- Get underwriting details
- Update underwriting information
- Request underwriting review

### Verification
Identity and document verification
- Initiate verification
- Complete verification steps
- Get verification status

### Document
Manage documents for compliance
- Upload documents (ID, business docs)
- Get document details
- Delete documents

### Institution
Look up financial institutions
- Search by name or routing number
- Get ACH/Wire participants

### File
Manage file uploads
- Upload files
- Download files
- Get file metadata

### Industry
Industry classification codes
- List industries
- Search by name
- Get MCC/NAICS codes

### Avatar
Account avatars/logos
- Upload, Get, Delete avatars

### Enrichment
Data enrichment services
- Enrich addresses
- Enrich profiles

### Analytics
Payment analytics and reporting
- Transfer analytics
- Account analytics
- Volume reports

### Schedule
Scheduled/recurring transfers
- Create, Update, Cancel schedules
- Get occurrences

### Webhook
Webhook management
- Create, Update, Delete webhooks
- Ping webhooks
- Enable/Disable webhooks

### Event
Event history and monitoring
- List events
- Get event details
- Filter by resource type

### Access Token
OAuth token management
- Create scoped tokens
- Revoke tokens
- List available scopes

### Onboarding
Account onboarding
- Create onboarding links
- Track onboarding status
- Resend invites

### Utility
Utility operations
- Test API connection
- Validate routing numbers
- Get supported countries/currencies
- Check rate limits

## Trigger Node

The **Moov Trigger** node enables real-time event-driven workflows:

### Event Categories

- **Account Events** - Created, Updated, Deleted
- **Bank Account Events** - Created, Verified, Deleted
- **Card Events** - Created, Updated, Expired
- **Transfer Events** - Created, Completed, Failed, Canceled
- **Refund Events** - Created, Completed, Failed
- **Dispute Events** - Created, Won, Lost, Evidence Required
- **Wallet Events** - Updated, Balance Changed
- **Verification Events** - Started, Completed, Failed
- **Underwriting Events** - Pending, Approved, Rejected
- **Schedule Events** - Created, Executed, Failed

## Usage Examples

### Create an Individual Account

```javascript
// Moov node configuration
{
  "resource": "account",
  "operation": "create",
  "accountType": "individual",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+14155551234"
}
```

### Link a Bank Account

```javascript
// Moov node configuration
{
  "resource": "bankAccount",
  "operation": "link",
  "accountId": "{{ $json.accountID }}",
  "routingNumber": "021000021",
  "accountNumber": "1234567890",
  "accountType": "checking",
  "holderName": "John Doe"
}
```

### Create a Transfer

```javascript
// Moov node configuration
{
  "resource": "transfer",
  "operation": "create",
  "amount": 1000,
  "currency": "USD",
  "sourcePaymentMethodId": "{{ $json.sourceWalletId }}",
  "destinationPaymentMethodId": "{{ $json.destBankAccountId }}",
  "description": "Payout"
}
```

### Handle Webhooks

```javascript
// MoovTrigger node configuration
{
  "eventCategory": "transfer",
  "events": ["transfer.completed", "transfer.failed"]
}

// Downstream nodes can access:
// {{ $json.eventType }}
// {{ $json.data.transferID }}
// {{ $json.data.status }}
```

## Moov Concepts

| Concept | Description |
|---------|-------------|
| **Facilitator** | Your platform's main Moov account |
| **Connected Account** | Sub-accounts for your users/merchants |
| **Capability** | Enabled feature (transfers, cards, wallets) |
| **Payment Method** | Funding source (bank, card, wallet) |
| **Transfer** | Money movement between accounts |
| **Wallet** | Moov-held balance account |
| **Micro-Deposits** | Bank verification via small deposits |
| **Underwriting** | Risk assessment for accounts |
| **Representative** | Business owner/officer |
| **Sweep** | Automatic wallet balance disbursement |
| **Occurrence** | Single instance of a scheduled transfer |

## Networks

| Network | Description | Use Cases |
|---------|-------------|-----------|
| **ACH** | Automated Clearing House | Bank-to-bank transfers |
| **Push-to-Card** | Card network rails | Instant payouts to debit cards |
| **Wallet** | Moov internal ledger | Instant internal transfers |
| **RTP** | Real-Time Payments | Instant bank transfers |

## Error Handling

The node provides detailed error information:

```javascript
// Error response structure
{
  "error": true,
  "message": "Transfer failed: Insufficient funds",
  "statusCode": 400,
  "details": {
    "code": "INSUFFICIENT_FUNDS",
    "field": "source.amount"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid credentials |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Duplicate operation |
| `422` | Unprocessable - Validation failed |
| `429` | Too Many Requests - Rate limited |

## Security Best Practices

1. **Never log API keys** - Use credential management
2. **Verify webhooks** - Always validate signatures
3. **Use HTTPS** - All API calls are encrypted
4. **Scoped tokens** - Request minimal permissions
5. **PCI Compliance** - Card data is tokenized
6. **Audit transfers** - Log all money movements
7. **Handle PII** - Encrypt sensitive data

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Moov API Docs](https://docs.moov.io)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-moov/issues)
- **Email**: support@velobpa.com
- **Moov Support**: [moov.io/support](https://moov.io/support)

## Acknowledgments

- [Moov](https://moov.io) - Payment infrastructure platform
- [n8n](https://n8n.io) - Workflow automation platform
- [Velocity BPA](https://velobpa.com) - Node development and maintenance
