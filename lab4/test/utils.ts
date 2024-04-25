import { ethers } from 'hardhat'
import { IToken } from '../typechain-types/contracts/libs'
import { HardhatEthersSigner } from './types'

const ERC1967_SLOTS = {
  ADMIN: 'eip1967.proxy.admin',
  IMPLEMENTATION: 'eip1967.proxy.implementation',
}

const SIMPLE_SAFE_SLOTS = {
  BALANCES: 'SimpleSafe.balances',
  FEES: 'SimpleSafe.fees',
}

export function randomAddress() {
  return ethers.Wallet.createRandom().address
}

export function randomUint256() {
  return ethers.toBigInt(ethers.randomBytes(32))
}

export async function mint(
  token: IToken,
  addresses: HardhatEthersSigner[],
  amount: number,
) {
  return Promise.all(addresses.map((address) => token.mint(address, amount)))
}

export async function approve(
  token: IToken,
  addresses: HardhatEthersSigner[],
  spender: string,
  amount: number,
) {
  return Promise.all(
    addresses.map((address) => token.connect(address).approve(spender, amount)),
  )
}

function getSlotAddress(slotName: string) {
  return BigInt(ethers.keccak256(ethers.toUtf8Bytes(slotName))) - 1n
}

async function getSlot(contract: any, slotName: string, resultType: string) {
  const data = await ethers.provider.getStorage(
    contract,
    getSlotAddress(slotName),
  )

  const abiCoder = new ethers.AbiCoder()
  return abiCoder.decode([resultType], data)
}

// any form of mapping(type1 => type2)
async function getSingleLevelMappingSlot(
  contract: any,
  slotName: string,
  key: string,
  type: string,
  resultType: string,
) {
  const abiCoder = new ethers.AbiCoder()

  const encoded = abiCoder.encode(
    [type, 'uint256'],
    [key, getSlotAddress(slotName)],
  )

  const slot = ethers.keccak256(encoded)

  const data = await ethers.provider.getStorage(contract, slot)

  return abiCoder.decode([resultType], data)
}

// any form of mapping(type1 => mapping(type2 => type3))
// slot[key1][key2] should be translated to
// keccak256(abi.encode(key2) . uint256(keccak256(abi.encode(key1, slot)))
// ref: https://ethereum.stackexchange.com/a/127375
async function getTwoLevelMappingSlot(
  contract: any,
  slotName: string,
  keys: [string, string],
  types: [string, string],
  resultType: string,
) {
  const abiCoder = new ethers.AbiCoder()

  const firstLevelEncoded = abiCoder.encode(
    [types[0], 'uint256'],
    [keys[0], getSlotAddress(slotName)],
  )

  const secondLevelEncoded = abiCoder.encode([types[1]], [keys[1]])

  const slot = ethers.keccak256(
    ethers.concat([secondLevelEncoded, ethers.keccak256(firstLevelEncoded)]),
  )

  const data = await ethers.provider.getStorage(contract, slot)

  return abiCoder.decode([resultType], data)
}

export const getAdmin = async (contract: any) =>
  (await getSlot(contract, ERC1967_SLOTS.ADMIN, 'address'))[0] as string

export const getImplementation = async (contract: any) =>
  (
    await getSlot(contract, ERC1967_SLOTS.IMPLEMENTATION, 'address')
  )[0] as string

export const getFee = async (contract: any, key: string) =>
  (
    await getSingleLevelMappingSlot(
      contract,
      SIMPLE_SAFE_SLOTS.FEES,
      key,
      'address',
      'uint256',
    )
  )[0] as BigInt

export const getBalance = async (contract: any, keys: [string, string]) =>
  (
    await getTwoLevelMappingSlot(
      contract,
      SIMPLE_SAFE_SLOTS.BALANCES,
      keys,
      ['address', 'address'],
      'uint256',
    )
  )[0] as BigInt
