#!/usr/bin/env node

import { $, argv, path } from 'zx'

const __filename = path.basename(new URL(import.meta.url).pathname)

if (argv._.length !== 1) {
  console.log(`Usage: ${__filename} <path to hardhat project>`)
  process.exit(1)
}

const pathToHardhatProject = argv._[0]
await $`pnpm --filter ${pathToHardhatProject} exec hardhat node`
