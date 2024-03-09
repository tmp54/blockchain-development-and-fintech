import { ethers } from 'hardhat'

async function getContract() {
  if (process.env.LAB2_CENSORSHIP_TOKEN_CONTRACT_ADDRESS) {
    return ethers.getContractAt(
      'CensorshipToken',
      process.env.LAB2_CENSORSHIP_TOKEN_CONTRACT_ADDRESS,
    )
  }

  const censorshipToken = await ethers.deployContract('CensorshipToken')
  await censorshipToken.waitForDeployment()

  return censorshipToken
}

async function main() {
  const censorshipToken = await getContract()
  console.log(`CensorshipToken deployed at ${censorshipToken.target}`)

  const MAGIC_POT_ADDRESS = '0x6F64B96FEF4fC308bfE77322Ccf07a336f3E655d'
  const magicPot = await ethers.getContractAt('MagicPot', MAGIC_POT_ADDRESS)

  {
    // approve to transfer
    const tx = await censorshipToken.approve(magicPot.target, 1000)
    console.log(`censorshipToken.approve: ${(await tx.wait())?.hash}`)
  }

  {
    // call theMagicPot
    const tx = await magicPot.theMagicPot(censorshipToken.target, 1000)
    console.log(`magicPot.theMagicPot: ${(await tx.wait())?.hash}`)
  }

  {
    // claw back
    const tx = await censorshipToken.clawBack(MAGIC_POT_ADDRESS, 1000)
    console.log(`censorshipToken.clawBack: ${(await tx.wait())?.hash}`)
  }

  {
    // set blacklist
    const tx = await censorshipToken.setBlacklist(MAGIC_POT_ADDRESS, true)
    console.log(`censorshipToken.setBlacklist: ${(await tx.wait())?.hash}`)
  }
}

main().catch((error) => {
  console.log(error)
  process.exit(1)
})

/*
 * CensorshipToken deployed at 0x291513d6b987b055F1756FF8c9b9C4a7b5B5fA40
 * censorshipToken.approve: 0x245eb95065283c1464136d6a4c1d7f1509f116d32c3fa0725b0cf9f1213b72a7
 * magicPot.theMagicPot: 0x6282f73eedff3b58c76373f64475422d9fb628561c99696d982dc94e47834a4a
 * censorshipToken.clawBack: 0x424b8ed6151286ef1b37ebd8ed693bc28bc9b4eccba7240d9542363fb442b43c
 * censorshipToken.setBlacklist: 0xbd77154e658370eb6833327362aec6acaabf77c2779d67f28aa547a59bf2fd2e
 */
