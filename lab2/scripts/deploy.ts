import { ethers } from 'hardhat'

async function main() {
  const censorshipToken = await ethers.deployContract('CensorshipToken')

  await censorshipToken.waitForDeployment()

  console.log(`CensorshipToken deployed to ${censorshipToken.target}`)
}

main().catch((error) => {
  console.log(error)
  process.exit(1)
})
