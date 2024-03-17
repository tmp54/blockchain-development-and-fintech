import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('CSAMM', function () {
  async function deployFixture() {
    const [token0, token1] = await Promise.all([
      ethers.getContractFactory('Token0').then((contract) => contract.deploy()),
      ethers.getContractFactory('Token1').then((contract) => contract.deploy()),
    ])
    await Promise.all([token0.waitForDeployment(), token1.waitForDeployment()])

    const CONVERSION_RATE = 5000
    // Note: testing an modified version of CSAMM where
    // all of the internal functions are all exposed.
    const CSAMM = await ethers.getContractFactory('CSAMMTest')
    const csamm = await CSAMM.deploy(
      token0.target,
      token1.target,
      CONVERSION_RATE,
    )
    await csamm.waitForDeployment()

    const accounts = await ethers.getSigners()

    await Promise.all(
      accounts.map(async (account) => {
        await token0.mint(account, 100000)
        await token1.mint(account, 100000)
      }),
    )

    return { token0, token1, csamm, CONVERSION_RATE, accounts }
  }

  async function deploySameWeightFixture() {
    const [token0, token1] = await Promise.all([
      ethers.getContractFactory('Token0').then((contract) => contract.deploy()),
      ethers.getContractFactory('Token1').then((contract) => contract.deploy()),
    ])
    await Promise.all([token0.waitForDeployment(), token1.waitForDeployment()])

    const CONVERSION_RATE = 10000
    // Note: testing an modified version of CSAMM where
    // all of the internal functions are all exposed.
    const CSAMM = await ethers.getContractFactory('CSAMMTest')
    const csamm = await CSAMM.deploy(
      token0.target,
      token1.target,
      CONVERSION_RATE,
    )
    await csamm.waitForDeployment()

    const accounts = await ethers.getSigners()

    await Promise.all(
      accounts.map(async (account) => {
        await token0.mint(account, 100000)
        await token1.mint(account, 100000)
      }),
    )

    return { token0, token1, csamm, CONVERSION_RATE, accounts }
  }

  describe('Deployment', function () {
    it('Should set token0, token1, conversionRate properly', async function () {
      const { token0, token1, csamm, CONVERSION_RATE } =
        await loadFixture(deployFixture)

      expect(await csamm.token0()).to.equal(token0.target)
      expect(await csamm.token1()).to.equal(token1.target)
      expect(await csamm.conversionRate()).to.equal(CONVERSION_RATE)
    })
  })

  describe('_min', async function () {
    it('Should work as expected', async function () {
      const { csamm } = await loadFixture(deployFixture)

      expect(await csamm.exposed_min(1, 2)).to.equal(1)
      expect(await csamm.exposed_min(2, 1)).to.equal(1)
    })
  })

  describe('_gcd', async function () {
    it('Should work as expected', async function () {
      const { csamm } = await loadFixture(deployFixture)

      expect(await csamm.exposed_gcd(5, 10)).to.equal(5)
      expect(await csamm.exposed_gcd(3, 7)).to.equal(1)
      expect(await csamm.exposed_gcd(1, 2)).to.equal(1)
    })
  })

  describe('_capWithFixedRatio', async function () {
    it('Should work as expected', async function () {
      const { csamm } = await loadFixture(deployFixture)

      // example from Notion
      expect(
        await csamm.exposed_capWithFixedRatio(1000, 2000, 5000, 5000),
      ).to.deep.equal([2500, 5000])

      // examples from Discord
      expect(
        await csamm.exposed_capWithFixedRatio(1000, 10000, 50000, 2000),
      ).to.deep.equal([200, 2000])
      expect(
        await csamm.exposed_capWithFixedRatio(10000, 1000, 50000, 2000),
      ).to.deep.equal([20000, 2000])
    })
  })

  describe('_normalizeAmount', async function () {
    it('Should work as expected', async function () {
      const { csamm } = await loadFixture(deployFixture)

      expect(await csamm.exposed_normalizeAmount(10, 1000, 5000)).to.equal(510)
      expect(await csamm.exposed_normalizeAmount(10, 1000, 20000)).to.equal(
        2010,
      )
    })
  })

  describe('trade', async function () {
    it('Should trade successfully', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [user],
      } = await loadFixture(deployFixture)

      // provide liquidity
      await token0.approve(csamm.target, 100000)
      await token1.approve(csamm.target, 100000)
      await csamm.provideLiquidity(100000, 100000)
      expect(await token0.balanceOf(user)).to.equal(0)
      expect(await token1.balanceOf(user)).to.equal(0)
      expect(await csamm.amount0()).to.equal(100000)
      expect(await csamm.amount1()).to.equal(100000)

      // 100 token0 -> 200 token1
      await token0.mint(user, 100)
      await token0.approve(csamm.target, 100)
      await csamm.trade(token0.target, 100)
      expect(await token0.balanceOf(user)).to.equal(0)
      expect(await token1.balanceOf(user)).to.equal(200)
      expect(await csamm.amount0()).to.equal(100100)
      expect(await csamm.amount1()).to.equal(99800)

      // 100 token1 -> 50 token0
      await token1.approve(csamm.target, 100)
      await csamm.trade(token1.target, 100)
      expect(await token0.balanceOf(user)).to.equal(50)
      expect(await token1.balanceOf(user)).to.equal(100)
      expect(await csamm.amount0()).to.equal(100050)
      expect(await csamm.amount1()).to.equal(99900)
    })

    it('Should fail if user has not enough tokens to trade with', async function () {
      const { csamm, token0, token1 } = await loadFixture(deployFixture)

      await token0.approve(csamm.target, 200000)
      await expect(
        csamm.trade(token0.target, 200000),
      ).to.be.revertedWithCustomError(token0, 'ERC20InsufficientBalance')

      await token1.approve(csamm.target, 200000)
      await expect(
        csamm.trade(token1.target, 200000),
      ).to.be.revertedWithCustomError(token1, 'ERC20InsufficientBalance')
    })

    it('Should fail if contract has not enough tokens to trade with', async function () {
      const { csamm, token0 } = await loadFixture(deployFixture)

      await token0.approve(csamm.target, 100000)
      await expect(csamm.trade(token0.target, 100000)).to.be.revertedWith(
        'CSAMM: Invalid amount',
      )
    })

    it('Should fail if the provided token address is not token0 nor token1', async function () {
      const { csamm, token0, token1 } = await loadFixture(deployFixture)

      // create a random address that is not token0 nor token1
      let wallet
      do {
        wallet = ethers.Wallet.createRandom()
      } while (
        wallet.address == token0.target ||
        wallet.address == token1.target
      )

      await expect(csamm.trade(wallet.address, 100000)).to.be.revertedWith(
        'CSAMM: Token address not valid',
      )
    })
  })

  describe('provideLiquidity', async function () {
    it('Should allow to provide any amount of any token if amount0 is 0', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user],
      } = await loadFixture(deployFixture)

      // making the pool 0 token0 and 1000 token1
      await token1.approve(csamm.target, 1000)
      await csamm.provideLiquidity(0, 1000)

      // provide 0 token0 and 0 token1 should have no affection to the state
      await expect(csamm.connect(user).provideLiquidity(0, 0)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(0)
      expect(await csamm.amount1()).to.equal(1000)
      expect(await token0.balanceOf(csamm.target)).to.equal(0)
      expect(await token1.balanceOf(csamm.target)).to.equal(1000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)

      // pool before: 0 token0, 1000 token1
      // pool after: 0 token0, 1100 token1
      // provide 0 token0 and 100 token1 should be allowed, as amount0 is 0
      await token1.connect(user).approve(csamm.target, 100)
      await expect(csamm.connect(user).provideLiquidity(0, 100)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(0)
      expect(await csamm.amount1()).to.equal(1100)
      expect(await token0.balanceOf(csamm.target)).to.equal(0)
      expect(await token1.balanceOf(csamm.target)).to.equal(1100)
      expect(await csamm.liquidityProvided(user)).to.equal(50)

      // pool before: 0 token0, 1100 token1
      // pool after: 1000 token0, 1200 token1
      // provide 1000 token0 and 100 token1 should be allowed, as amount0 is 0
      await token0.connect(user).approve(csamm.target, 1000)
      await token1.connect(user).approve(csamm.target, 100)
      await expect(csamm.connect(user).provideLiquidity(1000, 100)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(1000)
      expect(await csamm.amount1()).to.equal(1200)
      expect(await token0.balanceOf(csamm.target)).to.equal(1000)
      expect(await token1.balanceOf(csamm.target)).to.equal(1200)
      expect(await csamm.liquidityProvided(user)).to.equal(1100)
    })

    it('Should allow to provide any amount of any token if amount1 is 0', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user],
      } = await loadFixture(deployFixture)

      // making the pool 1000 token0 and 0 token1
      await token0.approve(csamm.target, 1000)
      await csamm.provideLiquidity(1000, 0)

      // provide 0 token0 and 0 token1 should have no affection to the state
      await expect(csamm.connect(user).provideLiquidity(0, 0)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(1000)
      expect(await csamm.amount1()).to.equal(0)
      expect(await token0.balanceOf(csamm.target)).to.equal(1000)
      expect(await token1.balanceOf(csamm.target)).to.equal(0)
      expect(await token0.balanceOf(user)).to.equal(100000)
      expect(await token1.balanceOf(user)).to.equal(100000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)

      // pool before: 1000 token0, 0 token1
      // pool after: 1100 token0, 0 token1
      // provide 100 token0 and 0 token1 should be allowed, as amount1 is 0
      await token0.connect(user).approve(csamm.target, 100)
      await expect(csamm.connect(user).provideLiquidity(100, 0)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(1100)
      expect(await csamm.amount1()).to.equal(0)
      expect(await token0.balanceOf(csamm.target)).to.equal(1100)
      expect(await token1.balanceOf(csamm.target)).to.equal(0)
      expect(await token0.balanceOf(user)).to.equal(99900)
      expect(await token1.balanceOf(user)).to.equal(100000)
      expect(await csamm.liquidityProvided(user)).to.equal(100)

      // pool before: 1100 token0, 0 token1
      // pool after: 1200 token0, 1000 token1
      // provide 100 token0 and 1000 token1 should be allowed, as amount1 is 0
      await token0.connect(user).approve(csamm.target, 100)
      await token1.connect(user).approve(csamm.target, 1000)
      await expect(csamm.connect(user).provideLiquidity(100, 1000)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(1200)
      expect(await csamm.amount1()).to.equal(1000)
      expect(await token0.balanceOf(csamm.target)).to.equal(1200)
      expect(await token1.balanceOf(csamm.target)).to.equal(1000)
      expect(await token0.balanceOf(user)).to.equal(99800)
      expect(await token1.balanceOf(user)).to.equal(99000)
      expect(await csamm.liquidityProvided(user)).to.equal(700)
    })

    it('Should allow to provide the amount of tokens that respect to the current ratio', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user],
      } = await loadFixture(deployFixture)

      // making the pool 1000 token0 and 2000 token1
      await token0.approve(csamm.target, 1000)
      await token1.approve(csamm.target, 2000)
      await csamm.provideLiquidity(1000, 2000)

      // pool before: 1000 token0, 2000 token1
      // pool after: 1100 token0, 2200 token1
      // provide 100 token0 and 200 token1
      await token0.connect(user).approve(csamm.target, 100)
      await token1.connect(user).approve(csamm.target, 200)
      await expect(csamm.connect(user).provideLiquidity(100, 200)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(1100)
      expect(await csamm.amount1()).to.equal(2200)
      expect(await token0.balanceOf(csamm.target)).to.equal(1100)
      expect(await token1.balanceOf(csamm.target)).to.equal(2200)
      expect(await token0.balanceOf(user)).to.equal(99900)
      expect(await token1.balanceOf(user)).to.equal(99800)
      expect(await csamm.liquidityProvided(user)).to.equal(200)

      // pool before: 1100 token0, 2200 token1
      // pool after: 3300 token0, 6600 token1
      // provide 2200 token0 and 5000 token1
      await token0.connect(user).approve(csamm.target, 2200)
      await token1.connect(user).approve(csamm.target, 5000)
      await expect(csamm.connect(user).provideLiquidity(2200, 5000)).not.to.be
        .reverted
      expect(await csamm.amount0()).to.equal(3300)
      expect(await csamm.amount1()).to.equal(6600)
      expect(await token0.balanceOf(csamm.target)).to.equal(3300)
      expect(await token1.balanceOf(csamm.target)).to.equal(6600)
      expect(await token0.balanceOf(user)).to.equal(97700)
      expect(await token1.balanceOf(user)).to.equal(95400)
      expect(await csamm.liquidityProvided(user)).to.equal(4600)
    })
  })

  describe('withdrawLiquidity', async function () {
    it('Should allow to withdraw if amount0 is 0', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user],
      } = await loadFixture(deployFixture)

      // making the pool 1000 token0 and 0 token1
      await token0.approve(csamm.target, 1000)
      await csamm.provideLiquidity(1000, 0)

      // withdraw with nothing provided
      await expect(csamm.connect(user).withdrawLiquidity()).to.be.revertedWith(
        'CSAMM: Have no liquidity to be withdrew',
      )

      // provide 1000 token0 and 0 token1 on behalf of user
      await token0.connect(user).approve(csamm.target, 1000)
      await csamm.connect(user).provideLiquidity(1000, 0)

      // should withdraw successfully
      await expect(csamm.connect(user).withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(1000)
      expect(await csamm.amount1()).to.equal(0)
      expect(await token0.balanceOf(csamm.target)).to.equal(1000)
      expect(await token1.balanceOf(csamm.target)).to.equal(0)
      expect(await token0.balanceOf(user)).to.equal(100000)
      expect(await token1.balanceOf(user)).to.equal(100000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)

      // provide 1000 token0 and 0 token1 on behalf of user
      await token0.connect(user).approve(csamm.target, 1000)
      await csamm.connect(user).provideLiquidity(1000, 0)

      // pool before: 2000 token0, 0 token1
      // pool after 0 token0, 4000 token1
      await token1.approve(csamm.target, 4000)
      await csamm.trade(token1.target, 4000)

      await expect(csamm.connect(user).withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(0)
      expect(await csamm.amount1()).to.equal(2000)
      expect(await token0.balanceOf(csamm.target)).to.equal(0)
      expect(await token1.balanceOf(csamm.target)).to.equal(2000)
      expect(await token0.balanceOf(user)).to.equal(99000)
      expect(await token1.balanceOf(user)).to.equal(102000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)
    })

    it('Should allow to withdraw if amount1 is 0', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user],
      } = await loadFixture(deployFixture)

      // making the pool 0 token0 and 1000 token1
      await token1.approve(csamm.target, 1000)
      await csamm.provideLiquidity(0, 1000)

      // withdraw with nothing provided
      await expect(csamm.connect(user).withdrawLiquidity()).to.be.revertedWith(
        'CSAMM: Have no liquidity to be withdrew',
      )

      // provide 0 token0 and 1000 token1 on behalf of user
      await token1.connect(user).approve(csamm.target, 1000)
      await csamm.connect(user).provideLiquidity(0, 1000)

      // should withdraw successfully
      await expect(csamm.connect(user).withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(0)
      expect(await csamm.amount1()).to.equal(1000)
      expect(await token0.balanceOf(csamm.target)).to.equal(0)
      expect(await token1.balanceOf(csamm.target)).to.equal(1000)
      expect(await token0.balanceOf(user)).to.equal(100000)
      expect(await token1.balanceOf(user)).to.equal(100000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)

      // provide 0 token0 and 1000 token1 on behalf of user
      await token1.connect(user).approve(csamm.target, 1000)
      await csamm.connect(user).provideLiquidity(0, 1000)

      // pool before: 0 token0, 2000 token1
      // pool after 1000 token0, 0 token1
      await token0.approve(csamm.target, 1000)
      await csamm.trade(token0.target, 1000)

      await expect(csamm.connect(user).withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(500)
      expect(await csamm.amount1()).to.equal(0)
      expect(await token0.balanceOf(csamm.target)).to.equal(500)
      expect(await token1.balanceOf(csamm.target)).to.equal(0)
      expect(await token0.balanceOf(user)).to.equal(100500)
      expect(await token1.balanceOf(user)).to.equal(99000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)
    })

    it('Should allow to withdraw the amount of tokens that respect to the current ratio', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user],
      } = await loadFixture(deployFixture)

      // making the pool 1000 token0 and 2000 token1
      await token0.approve(csamm.target, 1000)
      await token1.approve(csamm.target, 2000)
      await csamm.provideLiquidity(1000, 2000)

      // pool before: 1000 token0, 2000 token1
      // pool after: 2000 token0, 4000 token1
      // provide 1000 token0 and 2000 token1
      await token0.connect(user).approve(csamm.target, 1000)
      await token1.connect(user).approve(csamm.target, 2000)
      await csamm.connect(user).provideLiquidity(1000, 2000)

      await expect(csamm.connect(user).withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(1000)
      expect(await csamm.amount1()).to.equal(2000)
      expect(await token0.balanceOf(csamm.target)).to.equal(1000)
      expect(await token1.balanceOf(csamm.target)).to.equal(2000)
      expect(await token0.balanceOf(user)).to.equal(100000)
      expect(await token1.balanceOf(user)).to.equal(100000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)

      // pool before: 1000 token0, 2000 token1
      // pool after: 2000 token0, 4000 token1
      // provide 1000 token0 and 2000 token1
      await token0.connect(user).approve(csamm.target, 1000)
      await token1.connect(user).approve(csamm.target, 2000)
      await csamm.connect(user).provideLiquidity(1000, 2000)

      // pool before: 2000 token0, 4000 token1
      // pool after: 3000 token0, 2000 token1
      // trade 1000 token0 -> 2000 token1
      await token0.approve(csamm.target, 1000)
      await csamm.trade(token0.target, 1000)

      // pool before: 3000 token0, 2000 token1
      // pool after: 1500 token0, 1000 token1
      // should withdraw 1500 token0, 1000 token1
      await expect(csamm.connect(user).withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(1500)
      expect(await csamm.amount1()).to.equal(1000)
      expect(await token0.balanceOf(csamm.target)).to.equal(1500)
      expect(await token1.balanceOf(csamm.target)).to.equal(1000)
      expect(await token0.balanceOf(user)).to.equal(100500)
      expect(await token1.balanceOf(user)).to.equal(99000)
      expect(await csamm.liquidityProvided(user)).to.equal(0)
    })

    it('Should pass the example mentioned in class', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [_, user1, user2],
      } = await loadFixture(deploySameWeightFixture)

      await token0.connect(user1).approve(csamm.target, 100)
      await expect(csamm.connect(user1).provideLiquidity(100, 0)).not.to.be
        .reverted

      await token1.connect(user2).approve(csamm.target, 40)
      await expect(csamm.connect(user2).trade(token1.target, 40)).not.to.be
        .reverted

      await token0.connect(user2).approve(csamm.target, 6)
      await token1.connect(user2).approve(csamm.target, 4)
      await expect(csamm.connect(user2).provideLiquidity(6, 4)).not.to.be
        .reverted

      await token1.connect(user1).approve(csamm.target, 66)
      await expect(csamm.connect(user1).trade(token1.target, 66)).not.to.be
        .reverted

      await expect(csamm.connect(user2).withdrawLiquidity()).not.to.be.reverted

      expect(await csamm.amount0()).to.equal(0)
      expect(await csamm.amount1()).to.equal(100)
      expect(await csamm.liquidityProvided(user2)).to.equal(0)

      await token0.connect(user1).approve(csamm.target, 13)
      await token1.connect(user1).approve(csamm.target, 17)
      await expect(csamm.connect(user1).provideLiquidity(13, 17)).not.to.be
        .reverted
    })
  })

  describe('Operational', async function () {
    it('#1: CSAMM with conversionRate of 10000', async function () {
      const { csamm, token0 } = await loadFixture(deploySameWeightFixture)

      await token0.approve(csamm.target, 100)
      await expect(csamm.trade(token0.target, 100)).to.be.reverted
    })

    it('#2: CSAMM with conversionRate of 5000', async function () {
      const {
        csamm,
        token0,
        token1,
        accounts: [user],
      } = await loadFixture(deployFixture)

      await token0.approve(csamm.target, 100)
      await expect(csamm.trade(token0.target, 100)).to.be.reverted

      await token0.approve(csamm.target, 50000)
      await token1.approve(csamm.target, 2000)
      await expect(csamm.provideLiquidity(50000, 2000)).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(50000)
      expect(await csamm.amount1()).to.equal(2000)
      expect(await csamm.liquidityProvided(user)).to.equal(51000)

      await token1.approve(csamm.target, 200)
      await expect(csamm.trade(token1.target, 200)).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(49900)
      expect(await csamm.amount1()).to.equal(2200)

      await expect(csamm.withdrawLiquidity()).not.to.be.reverted
      expect(await csamm.amount0()).to.equal(0)
      expect(await csamm.amount1()).to.equal(0)
      expect(await token0.balanceOf(user)).to.equal(100000)
      expect(await token0.balanceOf(user)).to.equal(100000)
    })
  })
})
