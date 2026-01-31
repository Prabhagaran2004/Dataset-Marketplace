# Deployment & Implementation Guide

## Quick Start

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Open http://localhost:3000 in your browser.

---

## Smart Contract Deployment

### Step 1: Set Up Hardhat Project

```bash
npm install -D hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### Step 2: Configure for 0G Network

Update `hardhat.config.js`:

```javascript
module.exports = {
  solidity: "0.8.20",
  networks: {
    og_testnet: {
      url: "https://evmrpc-testnet.0g.ai",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 16602,
    },
    og_mainnet: {
      url: "https://evmrpc.0g.ai",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 16661,
    },
  },
  etherscan: {
    apiKey: process.env.BLOCK_EXPLORER_API_KEY,
  },
};
```

### Step 3: Deploy Contract

```bash
npx hardhat run scripts/deploy.js --network og_testnet
```

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const Marketplace = await hre.ethers.getContractFactory("DatasetMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.deployed();

  console.log("Marketplace deployed to:", marketplace.address);

  // Update .env.local with contract address
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_MARKETPLACE_CONTRACT=${marketplace.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Step 4: Verify Contract (Optional)

```bash
npx hardhat verify --network og_testnet <CONTRACT_ADDRESS>
```

---

## Frontend Setup

### 1. Update Environment Variables

Copy `.env.local` and update with your deployed contract address:

```bash
NEXT_PUBLIC_MARKETPLACE_CONTRACT=0x<your_contract_address>
```

### 2. Test Locally

```bash
bun run dev
```

### 3. Build Production

```bash
bun run build
bun run start
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial Dataset Marketplace"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Select the project folder
5. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_INDEXER_RPC`
   - `NEXT_PUBLIC_MARKETPLACE_CONTRACT`
6. Click "Deploy"

### 3. Verify Deployment

Once deployed, Vercel will provide your production URL.

---

## Testing Workflow

### Testnet Testing Steps

1. **Get Testnet Tokens**
   - Visit [faucet.0g.ai](https://faucet.0g.ai)
   - Claim 0.1 0G tokens (daily limit)

2. **Connect Wallet**
   - Open your deployed app
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Auto-switch to 0G Testnet (Chain ID: 16602)

3. **Upload Dataset**
   - Go to "Upload Dataset"
   - Fill in metadata
   - Upload test file
   - Set price
   - Submit transaction
   - Approve in MetaMask

4. **Purchase Dataset**
   - Go to home page (different wallet or new incognito window)
   - Find your listed dataset
   - Click to view details
   - Click "Purchase Access"
   - Approve payment in MetaMask

5. **Download Dataset**
   - View dataset you purchased
   - Click "Download" button
   - File should download

---

## Backend API Implementation (Optional)

For production 0G Storage integration, you'll need a backend API:

### API Endpoints Needed

```typescript
// POST /api/upload
// Uploads file to 0G Storage
// Body: FormData with file
// Response: { rootHash: string, size: number }

// GET /api/download/:rootHash
// Downloads file from 0G Storage
// Response: File blob (requires access verification)

// POST /api/verify-access
// Verifies user has smart contract access
// Body: { datasetId: number, userAddress: string }
// Response: { hasAccess: boolean }
```

### Example Node.js Backend

```typescript
// pages/api/upload.ts
import { Indexer } from '@0glabs/0g-ts-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const file = req.files.file;
    const indexer = new Indexer(process.env.0G_INDEXER_RPC);

    // Upload to 0G Storage
    const rootHash = await indexer.upload(...);

    res.json({ rootHash, size: file.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

## Troubleshooting

### MetaMask Connection Issues

**Problem**: "MetaMask not installed"

- **Solution**: Install MetaMask extension from [metamask.io](https://metamask.io)

**Problem**: "Cannot switch network"

- **Solution**: Manually add 0G network in MetaMask:
  - Network: 0G Testnet
  - RPC: https://evmrpc-testnet.0g.ai
  - Chain ID: 16602

### Contract Deployment Issues

**Problem**: "Insufficient gas"

- **Solution**: Ensure wallet has enough 0G tokens from faucet

**Problem**: "Contract deployment failed"

- **Solution**: Check:
  - Solidity version compatibility
  - OpenZeppelin import paths
  - Network RPC connectivity

### Upload Issues

**Problem**: "Upload timeout"

- **Solution**:
  - Try smaller file sizes first
  - Check internet connection
  - Verify indexer RPC is accessible

---

## Performance Optimization

### Frontend

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Already handled by Next.js
3. **Caching**: Enable vercel analytics

### Smart Contract

1. **Gas Optimization**: Use `bytes32` for hashes (already done)
2. **Batching**: Consider batch operations for admin tasks

---

## Security Checklist

- [ ] Update contract addresses in `.env.local`
- [ ] Enable strict mode in TypeScript
- [ ] Validate all user inputs
- [ ] Never expose private keys
- [ ] Use environment variables for sensitive data
- [ ] Enable CORS properly on backend
- [ ] Rate limit API endpoints
- [ ] Use HTTPS only in production
- [ ] Test smart contract on testnet first
- [ ] Audit contract before mainnet deployment

---

## Monitoring & Analytics

### Vercel Analytics

```bash
# Enable analytics in Vercel dashboard
# Provides insights on:
# - Page load times
# - CLS, FID, LCP metrics
# - Traffic patterns
```

### Contract Events

Monitor contract events via Etherscan API:

```typescript
const eventFilter = contract.filters.DatasetListed();
const events = await contract.queryFilter(eventFilter);
```

---

## Next Steps

1. **Deploy to testnet** - Verify all features work
2. **Gather feedback** - Test with users
3. **Optimize gas costs** - If needed
4. **Deploy to mainnet** - When ready
5. **Monitor usage** - Track metrics
6. **Iterate** - Add v2 features based on feedback

---

## Support & Resources

- [0G Documentation](https://docs.0g.ai)
- [Next.js Docs](https://nextjs.org/docs)
- [ethers.js Docs](https://docs.ethers.org)
- [Solidity Docs](https://docs.soliditylang.org)
- [OpenZeppelin Docs](https://docs.openzeppelin.com)
