import { ethers } from 'hardhat'
import { generateSalt, getContractAtFromTx } from './utils'
import { MyOwnSafe, MyOwnSafeUpgradeable } from '../typechain-types'

enum Type {
  DeployMyOwnSafe,
  DeployMyOwnSafeWithCreate2,
  DeployMyOwnSafeUpgradeable,
  DeployMyOwnSafeUpgradeableWithCreate2,
}

async function deploy(type?: Type) {
  const myOwnSafeUpgradeableImplementation = await ethers.deployContract(
    'MyOwnSafeUpgradeable',
  )
  await myOwnSafeUpgradeableImplementation.waitForDeployment()

  const safeFactory = await ethers.deployContract('SafeFactory', [
    myOwnSafeUpgradeableImplementation,
  ])
  await safeFactory.waitForDeployment()

  const token = await ethers.deployContract('Token')
  await token.waitForDeployment()

  const [owner, otherAccount] = await ethers.getSigners()

  const salt = generateSalt()

  let myOwnSafe = undefined
  let myOwnSafeUpgradeable = undefined
  switch (type) {
    case Type.DeployMyOwnSafe: {
      myOwnSafe = await getContractAtFromTx<MyOwnSafe>(
        await safeFactory.deploySafe(owner),
        'MyOwnSafe',
        'SafeDeployed',
      )
      break
    }
    case Type.DeployMyOwnSafeWithCreate2: {
      myOwnSafe = await getContractAtFromTx<MyOwnSafe>(
        await safeFactory.deploySafeWithCreate2(owner, salt),
        'MyOwnSafe',
        'SafeWithCreate2Deployed',
      )
      break
    }
    case Type.DeployMyOwnSafeUpgradeable: {
      myOwnSafeUpgradeable = await getContractAtFromTx<MyOwnSafeUpgradeable>(
        await safeFactory.deploySafeUpgradeable(owner),
        'MyOwnSafeUpgradeable',
        'SafeUpgradeableDeployed',
      )
      break
    }
    case Type.DeployMyOwnSafeUpgradeableWithCreate2: {
      myOwnSafeUpgradeable = await getContractAtFromTx<MyOwnSafeUpgradeable>(
        await safeFactory.deploySafeUpgradeableWithCreate2(owner, salt),
        'MyOwnSafeUpgradeable',
        'SafeUpgradeableWithCreate2Deployed',
      )
      break
    }
    default:
      break
  }

  return {
    myOwnSafeUpgradeableImplementation,
    safeFactory,
    token,

    owner,
    otherAccount,

    salt,
    myOwnSafe,
    myOwnSafeUpgradeable,
  }
}

export function deployFixture() {
  return deploy()
}

export function deployMyOwnSafeFixture() {
  return deploy(Type.DeployMyOwnSafe)
}

export function deployMyOwnSafeWithCreate2Fixture() {
  return deploy(Type.DeployMyOwnSafeWithCreate2)
}

export function deployMyOwnSafeUpgradeableFixture() {
  return deploy(Type.DeployMyOwnSafeUpgradeable)
}

export function deployMyOwnSafeUpgradeableWithCreate2Fixture() {
  return deploy(Type.DeployMyOwnSafeUpgradeableWithCreate2)
}
