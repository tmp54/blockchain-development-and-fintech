import { ethers } from 'hardhat'

async function main() {
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
  console.log(`Token0 deployed to ${token0.target}`)
  console.log(`Token1 deployed to ${token1.target}`)
  console.log(`SimpleSafeV1 deployed to ${simpleSafeV1.target}`)
  console.log(`SimpleSafeV2 deployed to ${simpleSafeV2.target}`)

  const proxyContract = await ethers.deployContract('ProxyContract', [
    simpleSafeV1,
    '0x',
  ])
  await proxyContract.waitForDeployment()
  console.log(`ProxyContract deployed to ${proxyContract.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
