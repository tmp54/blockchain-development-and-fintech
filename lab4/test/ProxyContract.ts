import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { deployV1Fixture } from './fixtures'
import { getAdmin, getImplementation } from './utils'
import { SimpleSafeV2 } from '../typechain-types'

describe('ProxyContract', function () {
  describe('Deployment', function () {
    it('Should set admin correctly', async function () {
      const { proxiedV1, admin } = await loadFixture(deployV1Fixture)

      const adminAddress = await getAdmin(proxiedV1)
      expect(adminAddress).to.equal(admin.address)
    })

    it('Should set the implementation correctly', async function () {
      const { simpleSafeV1, proxiedV1 } = await loadFixture(deployV1Fixture)

      const implementationAddress = await getImplementation(proxiedV1)
      expect(implementationAddress).to.equal(simpleSafeV1.target)
    })
  })

  describe('upgradeToAndCall', async function () {
    it('Should be able to called by admin', async function () {
      const { proxyContract, simpleSafeV2, admin } =
        await loadFixture(deployV1Fixture)

      await expect(
        proxyContract.connect(admin).upgradeToAndCall(simpleSafeV2, '0x'),
      ).not.to.be.reverted

      const proxiedV2 = simpleSafeV2.attach(proxyContract) as SimpleSafeV2

      const implementationAddress = await getImplementation(proxiedV2)
      expect(implementationAddress).to.equal(simpleSafeV2.target)
    })

    it('Should not be able to called by non-admin', async function () {
      const {
        proxyContract,
        simpleSafeV2,
        accounts: [otherAccount],
      } = await loadFixture(deployV1Fixture)

      await expect(
        proxyContract
          .connect(otherAccount)
          .upgradeToAndCall(simpleSafeV2, '0x'),
      ).to.be.revertedWithCustomError(proxyContract, 'ProxyUnauthorizedError')
    })
  })
})
