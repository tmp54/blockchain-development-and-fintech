import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { ethers } from 'hardhat'
import { shouldBehaveLikeASafe } from './shared'

describe('MyOwnSafe', async function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const [myOwnSafe, token] = await Promise.all([
      ethers.deployContract('MyOwnSafe', [owner]),
      ethers.deployContract('Token'),
    ])
    await Promise.all([
      myOwnSafe.waitForDeployment(),
      token.waitForDeployment(),
    ])

    return {
      myOwnSafe,
      token,

      owner,
      otherAccount,
    }
  }

  beforeEach(async function () {
    const context = await loadFixture(deployFixture)
    Object.assign(this, context, { safe: context.myOwnSafe })
  })

  shouldBehaveLikeASafe()
})
