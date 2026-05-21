#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const templatePath = resolve(root, '.npmrc.template')
const npmrcPath = resolve(root, '.npmrc')

const CODEARTIFACT_REGISTRY =
  'https://topsale-533267398655.d.codeartifact.ap-southeast-2.amazonaws.com/npm/Label-printing-js-core-prelaunch/'

function getBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim()
  } catch {
    console.warn('[setup-npmrc] 无法检测 git 分支，默认使用 NPM')
    return 'main'
  }
}

const branch = getBranch()
const isDevelop = branch === 'develop'

if (!isDevelop) {
  if (existsSync(npmrcPath)) {
    unlinkSync(npmrcPath)
    console.log(`[setup-npmrc] 分支: ${branch} → 删除 .npmrc（走默认 NPM）`)
  } else {
    console.log(`[setup-npmrc] 分支: ${branch} → 无需 .npmrc（走默认 NPM）`)
  }
  process.exit(0)
}

const template = readFileSync(templatePath, 'utf8')
const content = template.replace(/\{\{REGISTRY_URL\}\}/, CODEARTIFACT_REGISTRY)
writeFileSync(npmrcPath, content)
console.log(`[setup-npmrc] 分支: ${branch} → .npmrc 指向 CodeArtifact`)
