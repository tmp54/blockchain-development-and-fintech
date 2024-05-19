import { expect } from 'chai'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '../types'
import { MyOwnSafe, MyOwnSafeUpgradeable, Token } from '../../typechain-types'

export type SafeTestContext<T = MyOwnSafe | MyOwnSafeUpgradeable> =
  Mocha.Context & {
    safe: T
    token: Token
    owner: HardhatEthersSigner
    otherAccount: HardhatEthersSigner
  }

export function shouldBehaveLikeASafe() {
  describe('owner', async function () {
    it('should set correct owner', async function (this: SafeTestContext) {
      expect(await this.safe.owner()).to.equal(this.owner)
    })
  })

  describe('withdraw', async function () {
    beforeEach(async function (this: SafeTestContext) {
      await this.token.mint(this.safe, 1000)
    })

    it('should throw if now called by owner', async function (this: SafeTestContext) {
      await expect(
        this.safe.connect(this.otherAccount).withdraw(this.token, 1000),
      ).to.be.revertedWith('!owner')
    })

    it('should allow owner to withdraw', async function (this: SafeTestContext) {
      expect(await this.safe.withdraw(this.token, 1000)).to.changeTokenBalances(
        this.token,
        [this.safe, this.owner],
        [-1000, 1000],
      )
    })
  })

  describe('count', async function () {
    it('should throw if not called by owner', async function (this: SafeTestContext) {
      await expect(
        this.safe.connect(this.otherAccount).count(),
      ).to.be.revertedWith('!owner')
    })

    it('should be able to be called by owner', async function (this: SafeTestContext) {
      await expect(this.safe.count()).not.to.be.reverted
    })

    it('should add counter by 1', async function (this: SafeTestContext) {
      const getCounter = async () => {
        return ethers.toBigInt(await ethers.provider.getStorage(this.safe, 1))
      }

      const initialCounter = await getCounter()
      await this.safe.count()
      expect(await getCounter()).to.equal(initialCounter + 1n)
    })
  })
}
