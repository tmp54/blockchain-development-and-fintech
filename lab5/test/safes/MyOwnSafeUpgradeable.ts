import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SafeTestContext, shouldBehaveLikeASafe } from './shared'
import { MyOwnSafeUpgradeable } from '../../typechain-types'

describe('MyOwnSafeUpgradeable', async function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const [myOwnSafeUpgradeable, token] = await Promise.all([
      ethers.deployContract('MyOwnSafeUpgradeable'),
      ethers.deployContract('Token'),
    ])
    await Promise.all([
      myOwnSafeUpgradeable.waitForDeployment(),
      token.waitForDeployment(),
    ])

    await myOwnSafeUpgradeable.initialize(owner)

    return {
      myOwnSafeUpgradeable,
      token,

      owner,
      otherAccount,
    }
  }

  beforeEach(async function () {
    const context = await loadFixture(deployFixture)
    Object.assign(this, context, { safe: context.myOwnSafeUpgradeable })
  })

  // not testing scenario before initialization for simplicity
  describe('initialize', async function () {
    it('should not be initialize twice', async function (this: SafeTestContext<MyOwnSafeUpgradeable>) {
      await expect(this.safe.initialize(this.owner)).to.be.revertedWith(
        'initialized',
      )
    })
  })

  shouldBehaveLikeASafe()
})
