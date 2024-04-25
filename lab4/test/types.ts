import { ethers } from 'hardhat'

export type HardhatEthersSigner = Awaited<
  ReturnType<typeof ethers.getSigners>
>[number]
