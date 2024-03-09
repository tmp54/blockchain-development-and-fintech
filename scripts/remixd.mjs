#!/usr/bin/env node

import { $, argv, fs, path } from 'zx'
import 'dotenv/config'

const __filename = path.basename(new URL(import.meta.url).pathname)

if (argv._.length !== 1) {
  console.log(`Usage: ${__filename} <path to expose>`)
  process.exit(1)
}

const pathToExpose = argv._[0]
if (!fs.existsSync(pathToExpose) || !fs.lstatSync(pathToExpose).isDirectory()) {
  console.log(`Error: ${pathToExpose} is not a valid directory`)
  process.exit(1)
}

const { REMIXD_URL } = process.env
await $`remixd -u ${REMIXD_URL} -s ${pathToExpose}`
