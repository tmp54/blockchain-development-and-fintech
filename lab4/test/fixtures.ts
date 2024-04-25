import { ethers } from 'hardhat'
import { SimpleSafeV1, SimpleSafeV2 } from '../typechain-types'
import { approve, mint } from './utils'

async function deployAllContractsAndMint(version: 1 | 2) {
  const [token0, token1, simpleSafeV1, simpleSafeV2] = await Promise.all([
    ethers.deployContract('Token0'),
    ethers.deployContract('Token1'),
    ethers.deployContract('SimpleSafeV1'),
    ethers.deployContract('SimpleSafeV2'),
  ])
  await Promise.all([
    token0.waitForDeployment(),
    token1.waitForDeployment(),
    simpleSafeV1.waitForDeployment(),
    simpleSafeV2.waitForDeployment(),
  ])

  // deploy proxy contract
  const VERSION = {
    1: simpleSafeV1,
    2: simpleSafeV2,
  }
  const ProxyContract = await ethers.getContractFactory('ProxyContract')
  const proxyContract = await ProxyContract.deploy(
    VERSION[version].target,
    '0x',
  )
  await proxyContract.waitForDeployment()

  // mint and approve
  const accounts = await ethers.getSigners()
  await Promise.all([
    mint(token0, accounts, 10000),
    mint(token1, accounts, 10000),
  ])
  const proxyContractAddress = await proxyContract.getAddress()
  await Promise.all([
    approve(token0, accounts, proxyContractAddress, 10000),
    approve(token1, accounts, proxyContractAddress, 10000),
  ])

  return {
    token0,
    token1,
    simpleSafeV1,
    simpleSafeV2,
    proxyContract,
    admin: accounts[0],
    accounts: accounts.slice(1),
  }
}

export async function deployV1Fixture() {
  const contracts = await deployAllContractsAndMint(1)

  const proxiedV1 = contracts.simpleSafeV1.attach(
    contracts.proxyContract,
  ) as SimpleSafeV1

  return {
    ...contracts,

    proxiedV1,
  }
}

export async function deployV2Fixture() {
  const contracts = await deployAllContractsAndMint(2)

  const proxiedV2 = contracts.simpleSafeV2.attach(
    contracts.proxyContract,
  ) as SimpleSafeV2

  return {
    ...contracts,

    proxiedV2,
  }
}
