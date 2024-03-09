# Blockchain Development and Fintech

## Setup

Environment variables:
- `REMIXD_URL`: URL passed to remixd
- `ALCHEMY_API_KEY`: obtain from Alchemy
- `ETHERSCAN_API_KEY`: obtain from Etherscan
- `SEPOLIA_PRIVATE_KEY`: private key exported from MetaMask

## Scripts

```shell
# compile
pnpm hardhat compile

# test
pnpm hardhat test
REPORT_GAS=true pnpm hardhat test

# node
pnpm hardhat node

# deploy
pnpm hardhat run --network sepolia <path to script>

# start remixd
./scripts/remixd.mjs <path to expose>

# start local node
./scripts/hardhat-node.mjs <path to hardhat project>

# generate coverage
pnpm hardhat coverage

# start coverage status page
pnpm serve:coverage

# generate docs
pnpm hardhat docgen
```

