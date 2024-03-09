declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ALCHEMY_API_KEY: string
      ETHERSCAN_API_KEY: string
      SEPOLIA_PRIVATE_KEY: string
      LAB2_CENSORSHIP_TOKEN_CONTRACT_ADDRESS: `0x${string}` | undefined
    }
  }
}

export {}
