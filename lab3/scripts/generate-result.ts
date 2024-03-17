import { ethers } from 'hardhat'
import { ContractTransactionResponse } from 'ethers'

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

  const censorshipToken = await ethers.deployContract(name, args)
  await censorshipToken.waitForDeployment()

  return censorshipToken
}

async function getMyAddress() {
  if (process.env.HARDHAT_NETWORK === 'localhost') {
    return (await ethers.getSigners())[0]
  }
  return process.env.MY_ADDRESS
}

async function getHash(tx: ContractTransactionResponse) {
  return (await tx.wait())?.hash
}

async function main() {
  const token0 = await getDeployedContract(
    'Token0',
    [],
    process.env.LAB3_TOKEN0_CONTRACT_ADDRESS,
  )
  console.log(`Token0 deployed at ${token0.target}`)

  const token1 = await getDeployedContract(
    'Token1',
    [],
    process.env.LAB3_TOKEN1_CONTRACT_ADDRESS,
  )
  console.log(`Token1 deployed at ${token1.target}`)

  // mint to myself
  const me = await getMyAddress()
  await token0.mint(me, 100000)
  await token1.mint(me, 100000)

  // Part 1: Deploy CSAMM with conversion rate of 10000
  {
    const csamm = await getDeployedContract(
      'CSAMM',
      [token0.target, token1.target, 10000],
      process.env.LAB3_CSAMM_CONTRACT_ADDRESS_1,
    )
    console.log(`CSAMM(10000) deployed at ${csamm.target}`)

    {
      // swap 100 token0 to token1
      await token0.approve(csamm.target, 100)
      try {
        const tx = await csamm.trade(token0.target, 100, { gasLimit: 1000000 })
        await tx.wait()
      } catch (e) {
        console.log(`csamm(10000).trade: ${(e as TXError).receipt.hash}`)
      }
    }
  }

  // Part 2: Deploy CSAMM with conversion rate of 5000
  {
    const csamm = await getDeployedContract(
      'CSAMM',
      [token0.target, token1.target, 10000],
      process.env.LAB3_CSAMM_CONTRACT_ADDRESS_2,
    )
    console.log(`CSAMM(5000) deployed at ${csamm.target}`)

    {
      // swap 100 token0 to token1
      await token0.approve(csamm.target, 100)
      try {
        const tx = await csamm.trade(token0.target, 100, { gasLimit: 1000000 })
        await tx.wait()
      } catch (e) {
        console.log(`csamm(5000).trade(#1): ${(e as TXError).receipt.hash}`)
      }
    }

    {
      // provide 50000 token0 and 2000 token1
      await token0.approve(csamm.target, 50000)
      await token1.approve(csamm.target, 2000)
      const tx = await csamm.provideLiquidity(50000, 2000)
      console.log(`csamm(5000).provideLiquidity: ${await getHash(tx)}`)
    }

    {
      // swap 200 token1 to token0
      await token1.approve(csamm.target, 200)
      const tx = await csamm.trade(token1.target, 200)
      console.log(`csamm(5000).trade(#2): ${await getHash(tx)}`)
    }

    {
      // withdraw
      const tx = await csamm.withdrawLiquidity()
      console.log(`csamm(5000).withdrawLiquidity: ${await getHash(tx)}`)
    }
  }
}

main().catch((error) => {
  console.log(error)
  process.exit(1)
})

/*
 * Token0 deployed at 0x51Aa1bCE1E316a90B0113B9fa5d11fab4c63f3A4
 * Token1 deployed at 0x48E92366d26D4f2552032b7118f9D4411A63AD50
 * CSAMM(10000) deployed at 0x8DFAdF0A5Dcaac8C01Fed92092d9B5a91C4284e6
 * csamm(10000).trade: 0x96e50c151d72c25178f2d1dac448c2989e96b87d308c083fba3cd45529a70ffa
 * CSAMM(5000) deployed at 0x8Bf7BcCc8D158a0E51CA931892afd4c46207B2ef
 * csamm(5000).trade(#1): 0x487ed7e3c7ccf5a648229d388504bc0786ce8163e6dbd07ffde01d5e0ad491e7
 * csamm(5000).provideLiquidity: 0xf207e7804d8f114dd87a65bbc5c8b67f72397916134bd7a6ac3053305a5fc22e
 * csamm(5000).trade(#2): 0xe0ebdb0cf64f24dc6911f478017671c6f55fc27efd0a7aff6c40fff5a11f8f4a
 * csamm(5000).withdrawLiquidity: 0xf379a53ade8db20cf67b9c96c2e97169272a10a3d9754b1e8c9d07e97f7330ec
 */
