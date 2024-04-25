declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ETHERSCAN_API_KEY_ZIRCUIT: string
      ZIRCUIT_PRIVATE_KEY: string
      LAB4_TOKEN0_CONTRACT_ADDRESS: `0x${string}` | ''
      LAB4_TOKEN1_CONTRACT_ADDRESS: `0x${string}` | ''
      LAB4_SIMPLE_SAFE_V1_CONTRACT_ADDRESS: `0x${string}` | ''
      LAB4_SIMPLE_SAFE_V2_CONTRACT_ADDRESS: `0x${string}` | ''
      LAB4_PROXY_CONTRACT_ADDRESS: `0x${string}` | ''
    }
  }
}

export {}
