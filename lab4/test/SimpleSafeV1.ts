import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { getBalance, getFee } from './utils'
import { deployV1Fixture } from './fixtures'

describe('SimpleSafeV1', async function () {
  describe('deposit', async function () {
    it('Should transfer provided amount of token', async function () {
      const {
        proxyContract,
        proxiedV1,
        token0,
        accounts: [account],
      } = await loadFixture(deployV1Fixture)

      await expect(
        proxiedV1.connect(account).deposit(token0, 1000),
      ).to.changeTokenBalances(token0, [account, proxyContract], [-1000, 1000])
    })

    it('Should take 0.1% of fee', async function () {
      const {
        proxiedV1,
        token0,
        accounts: [account],
      } = await loadFixture(deployV1Fixture)

      await proxiedV1.connect(account).deposit(token0, 1000)

      const fee = await getFee(proxiedV1, await token0.getAddress())
      expect(fee).to.equal(1)

      const balance = await getBalance(proxiedV1, [
        await token0.getAddress(),
        account.address,
      ])
      expect(balance).to.equal(999)
    })
  })

  describe('withdraw', async function () {
    it('Should withdraw provided amount of token', async function () {
      const {
        proxyContract,
        proxiedV1,
        token0,
        accounts: [account],
      } = await loadFixture(deployV1Fixture)

      await proxiedV1.connect(account).deposit(token0, 1000)

      await expect(
        proxiedV1.connect(account).withdraw(token0, 999),
      ).to.changeTokenBalances(token0, [account, proxyContract], [999, -999])

      const balance = await getBalance(proxiedV1, [
        await token0.getAddress(),
        account.address,
      ])
      expect(balance).to.equal(0)
    })

    it('Should be reverted if amount is exceeded', async function () {
      const {
        simpleSafeV1,
        proxiedV1,
        token0,
        accounts: [account],
      } = await loadFixture(deployV1Fixture)

      await proxiedV1.connect(account).deposit(token0, 1000)

      await expect(proxiedV1.connect(account).withdraw(token0, 1000))
        .to.be.revertedWithCustomError(
          simpleSafeV1,
          'SimpleSafeInsufficientBalance',
        )
        .withArgs(1000, 999)
    })
  })

  describe('takeFee', async function () {
    it('Should be reverted if called by non-admin', async function () {
      const {
        simpleSafeV1,
        proxiedV1,
        token0,
        accounts: [account],
      } = await loadFixture(deployV1Fixture)

      await expect(
        proxiedV1.connect(account).takeFee(token0),
      ).to.be.revertedWithCustomError(
        simpleSafeV1,
        'ImplementationUnauthorizedError',
      )
    })

    it('Should take fee as expected', async function () {
      const {
        proxyContract,
        proxiedV1,
        token0,
        token1,
        admin,
        accounts: [account1, account2, account3],
      } = await loadFixture(deployV1Fixture)

      await proxiedV1.connect(account1).deposit(token0, 1000)
      await proxiedV1.connect(account2).deposit(token0, 2000)
      await proxiedV1.connect(account3).deposit(token1, 3000)

      await expect(
        proxiedV1.connect(admin).takeFee(token0),
      ).to.changeTokenBalances(token0, [proxyContract, admin], [-3, 3])
      await expect(
        proxiedV1.connect(admin).takeFee(token1),
      ).to.changeTokenBalances(token1, [proxyContract, admin], [-3, 3])

      const fee0 = await getFee(proxiedV1, await token0.getAddress())
      expect(fee0).to.equal(0)

      const fee1 = await getFee(proxiedV1, await token1.getAddress())
      expect(fee1).to.equal(0)
    })
  })
})
