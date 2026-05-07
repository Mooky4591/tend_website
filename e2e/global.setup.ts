import { spawnSync } from 'child_process'
import path from 'path'

export default async function globalSetup() {
  // process.env already contains vars loaded by playwright.config.ts dotenv call
  const tsx = path.resolve(__dirname, '..', 'node_modules', '.bin', 'tsx')
  const result = spawnSync(tsx, [path.resolve(__dirname, 'seed.ts')], {
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) throw new Error('E2E seed script failed — see output above')
}
