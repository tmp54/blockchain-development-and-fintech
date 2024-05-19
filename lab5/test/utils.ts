import { ethers } from 'hardhat'
import { expect } from 'chai'
import { ContractTransactionResponse, EventLog, Log } from 'ethers'

export function generateSalt() {
  return ethers.randomBytes(32)
}

export function anyAddress(addressLike: string) {
  expect(addressLike).to.be.properAddress
  return true
}

type DeployedResponse = {
  owner: string
  contractAddress: string
}

function getArgsFromLogs(logs: (EventLog | Log)[], name: string) {
  const event = logs
    .filter((log): log is EventLog => 'fragment' in log)
    .find((log) => {
      return log.fragment.name === name
    })

  if (!event) {
    return undefined
  }

  return event.args as unknown as DeployedResponse
}

export async function getContractAtFromTx<ContractT>(
  tx: ContractTransactionResponse,
  contractName: string,
  eventName: string,
): Promise<ContractT> {
  const rc = await tx.wait()
  if (!rc) {
    throw new Error()
  }
  const args = getArgsFromLogs(rc.logs, eventName)
  if (!args) {
    throw new Error()
  }
  const { contractAddress } = args
  return ethers.getContractAt(
    contractName,
    contractAddress,
  ) as Promise<ContractT>
}
