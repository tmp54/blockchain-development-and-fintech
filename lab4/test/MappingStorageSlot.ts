import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { randomAddress, randomUint256 } from './utils'
import { ethers } from 'hardhat'
import { MappingStorageSlotMock } from '../typechain-types/contracts/mocks'

const slot = ethers.id('some.storage.slot')
const otherSlot = ethers.id('some.other.storage.slot')

const TYPES = [
  {
    name: 'AddressToUint256Mapping',
    type: 'mapping(address => uint256)',
    keys: [randomAddress()],
    value: randomUint256(),
    zero: 0n,
  },
  {
    name: 'AddressToAddressToUint256Mapping',
    type: 'mapping(address => mapping(address => uint256))',
    keys: [randomAddress(), randomAddress()],
    value: randomUint256(),
    zero: 0n,
  },
]

async function fixture() {
  return {
    mock: await ethers.deployContract('MappingStorageSlotMock'),
  }
}

describe('MappingStorageSlot', async function () {
  let mock: MappingStorageSlotMock

  beforeEach(async function () {
    ;({ mock } = await loadFixture(fixture))
  })

  for (const { name, type, keys, value, zero } of TYPES) {
    describe(`${type} storage slot`, async function () {
      it('set', async function () {
        await mock.getFunction(`set${name}Slot`)(slot, ...keys, value)
      })

      describe('get', async function () {
        beforeEach(async function () {
          await mock.getFunction(`set${name}Slot`)(slot, ...keys, value)
        })

        it('from right slot', async function () {
          expect(
            await mock.getFunction(`get${name}Slot`)(slot, ...keys),
          ).to.equal(value)
        })

        it('from other slot', async function () {
          expect(
            await mock.getFunction(`get${name}Slot`)(otherSlot, ...keys),
          ).to.equal(zero)
        })
      })
    })
  }
})
