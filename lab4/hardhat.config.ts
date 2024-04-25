import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    zircuit: {
      url: `https://zircuit1.p2pify.com`,
      accounts: [process.env.ZIRCUIT_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      zircuit: process.env.ETHERSCAN_API_KEY_ZIRCUIT,
    },
    customChains: [
      {
        network: 'zircuit',
        chainId: 48899,
        urls: {
          apiURL: 'https://explorer.zircuit.com/api/contractVerifyHardhat',
          browserURL: 'https://explorer.zircuit.com',
        },
      },
    ],
  },
}

export default config
