# Lab 4

> https://bdaf.notion.site/Lab4-Upgradeability-on-the-blockchain-b604ae44efd84cfe8e8ca9518499a027

## Getting Started

This repo is using pnpm monorepo, please refer to the [official document](https://pnpm.io/installation) to install pnpm.

After that, run `pnpm install -r` in the root directory. This will install the packages required for this project.

Next, `cp .env.example .env` in the root directory. You should fill in the following environment variables
- `ETHERSCAN_API_KEY_ZIRCUIT`: The API key to Zircuit's block explorer. [How to obtain](https://docs.zircuit.com/dev-tools/verifying-contracts#automated-verification).
- `ZIRCUIT_PRIVATE_KEY`: The private key of your wallet.

Below environment variables are optional and are used for preventing contracts from redeploying. (see: [generate-result.ts](./scripts/generate-result.ts#L12-L25))
- `LAB4_TOKEN0_CONTRACT_ADDRESS`
- `LAB4_TOKEN1_CONTRACT_ADDRESS`
- `LAB4_SIMPLE_SAFE_V1_CONTRACT_ADDRESS`
- `LAB4_SIMPLE_SAFE_V2_CONTRACT_ADDRESS`
- `LAB4_PROXY_CONTRACT_ADDRESS`

To run hardhat scripts, either
- in root directory, run `pnpm --filter lab4 exec hardhat <hardhat command>`, or
- in lab4 directory, run `pnpm hardhat <hardhat command>`.

Here are some scripts for you
```shell
# Compile
pnpm hardhat compile

# Test
pnpm hardhat test --network localhost

# Test (report gas)
REPORT_GAS=true pnpm hardhat test --network localhost

# Coverage
pnpm hardhat coverage
# To show coverage report on browser, run in root directory
pnpm serve:coverage

# Deploy
pnpm hardhat run --network zircuit scripts/deploy.ts

# Verify
pnpm hardhat verify --network zircuit <contract address> [<constructor arguments>]
pnpm hardhat verify --network zircuit --contract <contract path>:<contract name> <contract address> [<constructor arguments>]
```

## Coverage

```
-----------------------------|----------|----------|----------|----------|----------------|
File                         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------------|----------|----------|----------|----------|----------------|
 contracts/                  |      100 |      100 |      100 |      100 |                |
  ProxyContract.sol          |      100 |      100 |      100 |      100 |                |
  SimpleSafeV1.sol           |      100 |      100 |      100 |      100 |                |
  SimpleSafeV2.sol           |      100 |      100 |      100 |      100 |                |
  Token0.sol                 |      100 |      100 |      100 |      100 |                |
  Token1.sol                 |      100 |      100 |      100 |      100 |                |
 contracts/interfaces/       |      100 |      100 |      100 |      100 |                |
  IToken.sol                 |      100 |      100 |      100 |      100 |                |
 contracts/libs/             |      100 |      100 |      100 |      100 |                |
  MappingStorageSlot.sol     |      100 |      100 |      100 |      100 |                |
 contracts/mocks/            |      100 |      100 |      100 |      100 |                |
  MappingStorageSlotMock.sol |      100 |      100 |      100 |      100 |                |
-----------------------------|----------|----------|----------|----------|----------------|
All files                    |      100 |      100 |      100 |      100 |                |
-----------------------------|----------|----------|----------|----------|----------------|
```

## Gas Report

```
·----------------------------------------------------------------------|----------------------------|-------------|-----------------------------·
|                         Solc version: 0.8.24                         ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 30000000 gas  │
·······································································|····························|·············|······························
|  Methods                                                                                                                                      │
···························|···········································|··············|·············|·············|···············|··············
|  Contract                ·  Method                                   ·  Min         ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
···························|···········································|··············|·············|·············|···············|··············
|  MappingStorageSlotMock  ·  setAddressToAddressToUint256MappingSlot  ·           -  ·          -  ·      46168  ·            3  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  MappingStorageSlotMock  ·  setAddressToUint256MappingSlot           ·           -  ·          -  ·      45551  ·            3  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  ProxyContract           ·  upgradeToAndCall                         ·       31352  ·      34152  ·      33219  ·            3  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  SimpleSafeV1            ·  deposit                                  ·       78837  ·     113037  ·     102350  ·           14  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  SimpleSafeV1            ·  takeFee                                  ·           -  ·          -  ·      46957  ·            6  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  SimpleSafeV1            ·  withdraw                                 ·       40730  ·      45552  ·      43141  ·            6  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  Token0                  ·  approve                                  ·           -  ·          -  ·      46904  ·           40  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  Token0                  ·  mint                                     ·       51787  ·      68899  ·      52653  ·           40  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  Token1                  ·  approve                                  ·           -  ·          -  ·      46904  ·           40  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  Token1                  ·  mint                                     ·       51787  ·      68899  ·      52653  ·           40  ·          -  │
···························|···········································|··············|·············|·············|···············|··············
|  Deployments                                                         ·                                          ·  % of limit   ·             │
·······································································|··············|·············|·············|···············|··············
|  MappingStorageSlotMock                                              ·           -  ·          -  ·     343964  ·        1.1 %  ·          -  │
·······································································|··············|·············|·············|···············|··············
|  ProxyContract                                                       ·      555775  ·     555787  ·     555781  ·        1.9 %  ·          -  │
·······································································|··············|·············|·············|···············|··············
|  SimpleSafeV1                                                        ·           -  ·          -  ·     627382  ·        2.1 %  ·          -  │
·······································································|··············|·············|·············|···············|··············
|  SimpleSafeV2                                                        ·           -  ·          -  ·     439863  ·        1.5 %  ·          -  │
·······································································|··············|·············|·············|···············|··············
|  Token0                                                              ·           -  ·          -  ·     941581  ·        3.1 %  ·          -  │
·······································································|··············|·············|·············|···············|··············
|  Token1                                                              ·           -  ·          -  ·     941581  ·        3.1 %  ·          -  │
·----------------------------------------------------------------------|--------------|-------------|-------------|---------------|-------------·
```
