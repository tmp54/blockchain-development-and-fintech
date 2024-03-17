declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ALCHEMY_API_KEY: string
      ETHERSCAN_API_KEY: string
      SEPOLIA_PRIVATE_KEY: string
      MY_ADDRESS: `0x${string}` | ''
      LAB3_TOKEN0_CONTRACT_ADDRESS: `0x${string}` | ''
      LAB3_TOKEN1_CONTRACT_ADDRESS: `0x${string}` | ''
      LAB3_CSAMM_CONTRACT_ADDRESS_1: `0x${string}` | ''
      LAB3_CSAMM_CONTRACT_ADDRESS_2: `0x${string}` | ''
    }
  }
}

export {}
