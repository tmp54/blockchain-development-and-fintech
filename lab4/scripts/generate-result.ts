import { ethers } from 'hardhat'
import { ContractTransactionResponse } from 'ethers'
import { getImplementation } from '../test/utils'
import { SimpleSafeV1 } from '../typechain-types'

type TXError = {
  receipt: {
    hash: string
  }
}

async function getDeployedContract(
  name: string,
  args: any[] = [],
  defaultValue?: string,
) {
  if (defaultValue) {
    return ethers.getContractAt(name, defaultValue)
  }

  const contract = await ethers.deployContract(name, args)
  await contract.waitForDeployment()

  return contract
}

async function getHash(tx: ContractTransactionResponse) {
  return (await tx.wait())?.hash
}

async function main() {
  const token0 = await getDeployedContract(
    'Token0',
    [],
    process.env.LAB4_TOKEN0_CONTRACT_ADDRESS,
  )
  console.log(`Token0 deployed at ${token0.target}`)

  const token1 = await getDeployedContract(
    'Token1',
    [],
    process.env.LAB4_TOKEN1_CONTRACT_ADDRESS,
  )
  console.log(`Token1 deployed at ${token1.target}`)

  const simpleSafeV1 = await getDeployedContract(
    'SimpleSafeV1',
    [],
    process.env.LAB4_SIMPLE_SAFE_V1_CONTRACT_ADDRESS,
  )
  console.log(`SimpleSafeV1 deployed at ${simpleSafeV1.target}`)

  const proxyContract = await getDeployedContract(
    'ProxyContract',
    [simpleSafeV1, '0x'],
    process.env.LAB4_PROXY_CONTRACT_ADDRESS,
  )
  console.log(`ProxyContract deployed at ${proxyContract.target}`)

  const simpleSafeV2 = await getDeployedContract(
    'SimpleSafeV2',
    [],
    process.env.LAB4_SIMPLE_SAFE_V2_CONTRACT_ADDRESS,
  )
  console.log(`SimpleSafeV2 deployed at ${simpleSafeV2.target}`)

  // upgrade
  await (async () => {
    if ((await getImplementation(proxyContract)) === simpleSafeV2.target) {
      return
    }
    const tx = await proxyContract.upgradeToAndCall(simpleSafeV2, '0x')
    console.log(`upgradeToAndCall(simpleSafeV2): ${await getHash(tx)}`)
  })()

  // use V1's interface to interact with upgraded implementation of V2
  const proxiedV2 = simpleSafeV1.attach(proxyContract) as SimpleSafeV1
  try {
    const tx = await proxiedV2.takeFee(token0.target, { gasLimit: 1000000 })
    await tx.wait()
  } catch (e) {
    console.log(`takeFee(reverted): ${(e as TXError).receipt.hash}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

// Token0 deployed at 0x291513d6b987b055F1756FF8c9b9C4a7b5B5fA40
// Token1 deployed at 0xff56667cA50b88acD526eB22db71bbDeEc70A2E5
// SimpleSafeV1 deployed at 0xde1D8A0Db97F7184f61c5A1B5d54228334D1f8AC
// ProxyContract deployed at 0xF5665EfAe4124EA876808D7eb0b70330C76B4303
// SimpleSafeV2 deployed at 0x5442e7AF30202FFc28b41be0F2C27D7283b31a02
// upgradeToAndCall(simpleSafeV2): 0x1f5cba3a562a78ae8006ba54bdac254c3208d8b69799883cca7db97c43d4ce0b
// takeFee(reverted): 0xd09f76aedfcf9d5fd732c445db54bbcf654a9f1e60e71d2941a30f09da4e86f9
