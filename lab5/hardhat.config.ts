import dotenv from 'dotenv'
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

dotenv.config({ path: '../.env' })

const config: HardhatUserConfig = {
  solidity: '0.8.24',
}

export default config
