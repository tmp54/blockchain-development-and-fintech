import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('CensorshipToken', function () {
  async function deployFixture() {
    const [master, blacklistAccount, ...otherAccounts] =
      await ethers.getSigners()

    const CensorshipToken = await ethers.getContractFactory('CensorshipToken')
    const censorshipToken = await CensorshipToken.deploy()

    await censorshipToken.waitForDeployment()

    // set initial amount of balance for every account to 1000
    await Promise.all(
      [blacklistAccount, ...otherAccounts].map((account) =>
        censorshipToken.mint(account, 1000),
      ),
    )

    // set an initial blacklist account
    await censorshipToken.setBlacklist(blacklistAccount, true)

    return { censorshipToken, master, blacklistAccount, otherAccounts }
  }

  async function getZeroAddressSigner() {
    return ethers.getImpersonatedSigner(ethers.ZeroAddress)
  }

  describe('Deployment', function () {
    it('Should set the master to sender', async function () {
      const { censorshipToken, master } = await loadFixture(deployFixture)

      expect(await censorshipToken.master()).to.equal(master.address)
    })

    it('Should set the censor to sender', async function () {
      const { censorshipToken, master } = await loadFixture(deployFixture)

      expect(await censorshipToken.censor()).to.equal(master.address)
    })

    it('Should mint 100,000,000 tokens to sender', async function () {
      const { censorshipToken, master } = await loadFixture(deployFixture)

      expect(await censorshipToken.balanceOf(master)).to.equal(100_000_000)
    })
  })

  describe('changeMaster', async function () {
    it('Should only be called by master', async function () {
      const {
        censorshipToken,
        otherAccounts: [newMaster, nonMaster, otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(nonMaster).changeMaster(otherAccount),
      ).to.be.revertedWith('CENS: You are not the master')
      await expect(censorshipToken.changeMaster(newMaster)).not.to.be.reverted
    })

    it('Should be changed to the provided address', async function () {
      const {
        censorshipToken,
        otherAccounts: [newMaster],
      } = await loadFixture(deployFixture)

      await censorshipToken.changeMaster(newMaster)

      expect(await censorshipToken.master()).to.equal(newMaster)
    })

    it('Should not be set to 0', async function () {
      const { censorshipToken } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.changeMaster((await getZeroAddressSigner()).address),
      ).to.be.revertedWith('CENS: Address should not be 0')
    })
  })

  describe('changeCensor', async function () {
    it('Should only be called by master', async function () {
      const {
        censorshipToken,
        otherAccounts: [newCensor, nonMaster, otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(nonMaster).changeCensor(otherAccount),
      ).to.be.revertedWith('CENS: You are not the master')
      await expect(censorshipToken.changeCensor(newCensor)).not.be.reverted
    })

    it('Should be changed to the provided address', async function () {
      const {
        censorshipToken,
        otherAccounts: [newCensor],
      } = await loadFixture(deployFixture)

      await censorshipToken.changeCensor(newCensor)

      expect(await censorshipToken.censor()).to.equal(newCensor)
    })

    it('Should not be set to 0', async function () {
      const { censorshipToken } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.changeCensor((await getZeroAddressSigner()).address),
      ).to.be.revertedWith('CENS: Address should not be 0')
    })
  })

  describe('setBlacklist', async function () {
    it('Should only be set by master and censor', async function () {
      const {
        censorshipToken,
        otherAccounts: [newCensor, otherAccount, blacklistAccount],
      } = await loadFixture(deployFixture)

      await censorshipToken.changeCensor(newCensor)

      await expect(censorshipToken.setBlacklist(blacklistAccount, true)).not.to
        .be.reverted
      await expect(
        censorshipToken.connect(newCensor).setBlacklist(blacklistAccount, true),
      ).not.to.be.reverted

      await expect(
        censorshipToken
          .connect(otherAccount)
          .setBlacklist(blacklistAccount, true),
      ).to.be.revertedWith('CENS: You are not the master nor the censor')
    })

    it('Should set blacklist properly', async function () {
      const {
        censorshipToken,
        otherAccounts: [blacklistAccount],
      } = await loadFixture(deployFixture)

      expect(await censorshipToken.blacklist(blacklistAccount)).to.be.false

      await expect(censorshipToken.setBlacklist(blacklistAccount, true)).not.to
        .be.reverted
      expect(await censorshipToken.blacklist(blacklistAccount)).to.be.true

      await expect(censorshipToken.setBlacklist(blacklistAccount, false)).not.to
        .be.reverted
      expect(await censorshipToken.blacklist(blacklistAccount)).to.be.false
    })
  })

  describe('clawBack', async function () {
    it('Should only be called by master', async function () {
      const {
        censorshipToken,
        otherAccounts: [nonMaster, otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(nonMaster).clawBack(otherAccount, 1000),
      ).to.be.revertedWith('CENS: You are not the master')
      await expect(censorshipToken.clawBack(otherAccount, 1000)).not.be.reverted
    })

    it('Should claw back successfully', async function () {
      const {
        censorshipToken,
        otherAccounts: [otherAccount],
      } = await loadFixture(deployFixture)

      await censorshipToken.clawBack(otherAccount, 1000)
      expect(await censorshipToken.balanceOf(otherAccount)).to.equal(0)
    })

    it('Should be reverted if balance is not enough', async function () {
      const {
        censorshipToken,
        otherAccounts: [otherAccount],
      } = await loadFixture(deployFixture)

      await expect(censorshipToken.clawBack(otherAccount, 2000))
        .to.be.revertedWithCustomError(
          censorshipToken,
          'ERC20InsufficientBalance',
        )
        .withArgs(otherAccount, 1000, 2000)
    })
  })

  describe('mint', async function () {
    it('Should only be called by master', async function () {
      const {
        censorshipToken,
        otherAccounts: [nonMaster, otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(nonMaster).mint(otherAccount, 1000),
      ).to.be.revertedWith('CENS: You are not the master')
      await expect(censorshipToken.mint(otherAccount, 1000)).not.to.be.reverted
    })
  })

  describe('burn', async function () {
    it('Should only be called by master', async function () {
      const {
        censorshipToken,
        otherAccounts: [nonMaster, otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(nonMaster).burn(otherAccount, 1000),
      ).to.be.revertedWith('CENS: You are not the master')
      await expect(censorshipToken.burn(otherAccount, 1000)).not.to.be.reverted
    })
  })

  describe('Blacklist functionality', async function () {
    it('Blacklisted accounts cannot transfer any tokens', async function () {
      const {
        censorshipToken,
        master,
        blacklistAccount,
        otherAccounts: [otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(blacklistAccount).transfer(otherAccount, 1000),
      ).to.be.revertedWith('CENS: Invalid sender')

      await censorshipToken.connect(blacklistAccount).approve(master, 1000)
      await expect(
        censorshipToken.transferFrom(blacklistAccount, otherAccount, 1000),
      ).to.be.revertedWith('CENS: Invalid sender')

      await expect(
        censorshipToken.clawBack(blacklistAccount, 1000),
      ).to.be.revertedWith('CENS: Invalid sender')
    })

    it('Could not transfer any tokens to blacklisted accounts', async function () {
      const {
        censorshipToken,
        master,
        blacklistAccount,
        otherAccounts: [otherAccount],
      } = await loadFixture(deployFixture)

      await expect(
        censorshipToken.connect(otherAccount).transfer(blacklistAccount, 1000),
      ).to.be.revertedWith('CENS: Invalid receiver')

      await censorshipToken.connect(otherAccount).approve(master, 1000)
      await expect(
        censorshipToken
          .connect(master)
          .transferFrom(otherAccount, blacklistAccount, 1000),
      ).to.be.revertedWith('CENS: Invalid receiver')
    })
  })
})
