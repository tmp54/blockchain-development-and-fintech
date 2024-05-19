import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { anyAddress } from './utils'
import {
  deployFixture,
  deployMyOwnSafeFixture,
  deployMyOwnSafeWithCreate2Fixture,
  deployMyOwnSafeUpgradeableFixture,
  deployMyOwnSafeUpgradeableWithCreate2Fixture,
} from './fixtures'
import { shouldBehaveLikeASafe } from './safes/shared'

describe('SafeFactory', function () {
  it('should set upgradeable contract address properly', async function () {
    const { myOwnSafeUpgradeableImplementation, safeFactory } =
      await loadFixture(deployFixture)

    expect(await safeFactory.safeUpgradeableAddress()).to.equal(
      myOwnSafeUpgradeableImplementation.target,
    )
  })

  describe('deploySafe', async function () {
    it('should emit SafeDeployed event', async function () {
      const { safeFactory, owner } = await loadFixture(deployFixture)

      await expect(safeFactory.deploySafe(owner))
        .to.emit(safeFactory, 'SafeDeployed')
        .withArgs(owner, anyAddress)
    })

    describe('The deployed contract should behave like the original one', async function () {
      beforeEach(async function () {
        const context = await loadFixture(deployMyOwnSafeFixture)
        Object.assign(this, context, { safe: context.myOwnSafe })
      })

      shouldBehaveLikeASafe()
    })
  })

  describe('deploySafeWithCreate2', async function () {
    it('should emit SafeWithCreate2Deployed event', async function () {
      const { safeFactory, owner, salt } = await loadFixture(deployFixture)

      expect(await safeFactory.deploySafeWithCreate2(owner, salt))
        .to.emit(safeFactory, 'SafeWithCreate2Deployed')
        .withArgs(owner, anyAddress)
    })

    describe('The deployed contract should behave like the original one', async function () {
      beforeEach(async function () {
        const context = await loadFixture(deployMyOwnSafeWithCreate2Fixture)
        Object.assign(this, context, { safe: context.myOwnSafe })
      })

      shouldBehaveLikeASafe()
    })
  })

  describe('deploySafeUpgradeable', async function () {
    it('should emit SafeUpgradeableDeployed event', async function () {
      const { safeFactory, owner } = await loadFixture(deployFixture)

      expect(await safeFactory.deploySafeUpgradeable(owner))
        .to.emit(safeFactory, 'SafeUpgradeableDeployed')
        .withArgs(owner, anyAddress)
    })

    describe('The deployed contract should behave like the original one', async function () {
      beforeEach(async function () {
        const context = await loadFixture(deployMyOwnSafeUpgradeableFixture)
        Object.assign(this, context, { safe: context.myOwnSafeUpgradeable })
      })

      shouldBehaveLikeASafe()
    })
  })

  describe('deploySafeUpgradeableWithCreate2', async function () {
    it('should emit SafeUpgradeableWithCreate2Deployed event', async function () {
      const { safeFactory, owner, salt } = await loadFixture(deployFixture)

      expect(await safeFactory.deploySafeUpgradeableWithCreate2(owner, salt))
        .to.emit(safeFactory, 'SafeUpgradeableWithCreate2Deployed')
        .withArgs(owner, anyAddress)
    })

    describe('The deployed contract should behave like the original one', async function () {
      beforeEach(async function () {
        const context = await loadFixture(
          deployMyOwnSafeUpgradeableWithCreate2Fixture,
        )
        Object.assign(this, context, { safe: context.myOwnSafeUpgradeable })
      })

      shouldBehaveLikeASafe()
    })
  })
})
