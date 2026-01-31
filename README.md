# Dataset Marketplace on 0G Chain

A decentralized dataset marketplace built on 0G blockchain with TypeScript, Next.js, Tailwind CSS, and 0G Storage SDK.

## Features

- 🔗 **Decentralized**: Smart contract powered marketplace on 0G chain
- 📦 **0G Storage Integration**: Store large datasets efficiently
- 💳 **Web3 Native**: MetaMask integration for seamless wallet connectivity
- 📊 **Dataset Management**: Upload, list, purchase, and download datasets
- 💰 **Seller Dashboard**: Track earnings and manage listings
- 🔐 **Access Control**: On-chain access verification

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: ethers.js v6, MetaMask
- **Storage**: 0G Storage SDK
- **Smart Contracts**: Solidity

## Getting Started

### Prerequisites

- Node.js 18+ and bun
- MetaMask extension installed
- 0G testnet funds from [faucet.0g.ai](https://faucet.0g.ai)

### Installation

```bash
# Install dependencies
bun install

# Create environment file
cp .env.local.example .env.local

# Update .env.local with your contract address after deployment
```

### Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dataset-marketplace/
├── contracts/
│   └── DatasetMarketplace.sol
├── src/
│   ├── app/
│   │   ├── page.tsx (marketplace browse)
│   │   ├── upload/page.tsx
│   │   ├── dataset/[id]/page.tsx
│   │   ├── my-datasets/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── DatasetCard.tsx
│   │   ├── UploadForm.tsx
│   │   └── WalletConnect.tsx
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useZgStorage.ts
│   │   └── useMarketplace.ts
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── zgClient.ts
│   └── types/
│       └── index.ts
├── .env.local
└── next.config.js
```

## Network Configuration

### 0G Testnet (Galileo)

- **Chain ID**: 16602
- **RPC**: https://evmrpc-testnet.0g.ai
- **Indexer**: https://indexer-storage-testnet-turbo.0g.ai
- **Explorer**: https://chainscan-galileo.0g.ai
- **Faucet**: https://faucet.0g.ai

### 0G Mainnet

- **Chain ID**: 16661
- **RPC**: https://evmrpc.0g.ai
- **Indexer**: https://indexer-storage-turbo.0g.ai
- **Explorer**: https://chainscan.0g.ai

## Smart Contract Deployment

1. Compile the contract:

   ```bash
   solc contracts/DatasetMarketplace.sol
   ```

2. Deploy to 0G testnet using Hardhat or your preferred tool

3. Update `NEXT_PUBLIC_MARKETPLACE_CONTRACT` in `.env.local`

## Usage

### For Sellers

1. Connect MetaMask wallet
2. Go to "Upload Dataset"
3. Fill in dataset metadata and upload file
4. Set price and submit
5. Monitor earnings on Dashboard
6. Withdraw funds anytime

### For Buyers

1. Browse datasets on home page
2. Search by name or filter by category
3. Click dataset to view details
4. Purchase access with 0G tokens
5. Download dataset after purchase

## Platform Fee

- **2.5%** platform fee on each purchase
- Fee goes to platform maintenance and governance

## Security

- Smart contract uses ReentrancyGuard
- Access control via on-chain mappings
- Input validation on file uploads
- Rate limiting warnings

## Environment Variables

```
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x...
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:

- 📖 [0G Documentation](https://docs.0g.ai)
- 💬 [0G Discord](https://discord.gg/0g)
- 🐛 [Report Issues](https://github.com/yourusername/dataset-marketplace/issues)
