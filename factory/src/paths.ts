import path from 'node:path'

export const REPO_ROOT = path.resolve(import.meta.dirname, '../..')
export const FACTORY_ROOT = path.join(REPO_ROOT, 'factory')
export const RUNS_ROOT = path.join(FACTORY_ROOT, 'runs')
export const CATALOG_PATH = path.join(FACTORY_ROOT, 'catalog', 'part1.catalog.json')
export const STAGING_ROOT = path.join(REPO_ROOT, 'content', 'staging', 'part1')
export const APPROVED_ROOT = path.join(REPO_ROOT, 'content', 'approved', 'part1')

export function assertSafeRunId(runId: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/u.test(runId)) throw new Error(`Unsafe run id: ${runId}`)
  return runId
}

export function runPath(runId: string, ...parts: string[]): string {
  return path.join(RUNS_ROOT, assertSafeRunId(runId), ...parts)
}
