import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { getBalance } from './utils'
import { deployV2Fixture } from './fixtures'

describe('SimpleSafeV2', async function () {
  describe('deposit', async function () {
    it('Should transfer provided amount of token', async function () {
      const {
        proxyContract,
        simpleSafeV2,
        proxiedV2,
        token0,
        accounts: [account],
      } = await loadFixture(deployV2Fixture)

      await proxyContract.upgradeToAndCall(simpleSafeV2, '0x')

      await expect(
        proxiedV2.connect(account).deposit(token0, 1000),
      ).to.changeTokenBalances(token0, [account, proxyContract], [-1000, 1000])

      const balance = await getBalance(proxiedV2, [
        await token0.getAddress(),
        account.address,
      ])
      expect(balance).to.equal(1000)
    })
  })

  describe('withdraw', async function () {
    it('Should withdraw provided amount of token', async function () {
      const {
        proxyContract,
        proxiedV2,
        token0,
        accounts: [account],
      } = await loadFixture(deployV2Fixture)

      await proxiedV2.connect(account).deposit(token0, 1000)

      await expect(
        proxiedV2.connect(account).withdraw(token0, 1000),
      ).to.changeTokenBalances(token0, [account, proxyContract], [1000, -1000])

      const balance = await getBalance(proxiedV2, [
        await token0.getAddress(),
        account.address,
      ])
      expect(balance).to.equal(0)
    })

    it('Should be reverted if amount is exceeded', async function () {
      const {
        simpleSafeV2,
        proxiedV2,
        token0,
        accounts: [account],
      } = await loadFixture(deployV2Fixture)

      await proxiedV2.connect(account).deposit(token0, 1000)

      await expect(proxiedV2.connect(account).withdraw(token0, 1001))
        .to.be.revertedWithCustomError(
          simpleSafeV2,
          'SimpleSafeInsufficientBalance',
        )
        .withArgs(1001, 1000)
    })
  })
})
