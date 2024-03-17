import { ethers } from 'hardhat'

async function main() {
  const [token0, token1] = await Promise.all([
    ethers.deployContract('Token0'),
    ethers.deployContract('Token1'),
  ])
  await Promise.all([token0.waitForDeployment(), token1.waitForDeployment()])
  console.log(`Token0 deployed to ${token0.target}`)
  console.log(`Token1 deployed to ${token1.target}`)

  const CONVERSION_RATE = 5000
  const csamm = await ethers.deployContract('CSAMM', [
    token0.target,
    token1.target,
    CONVERSION_RATE,
  ])
  await csamm.waitForDeployment()
  console.log(`CSAMM deployed to ${csamm.target}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
