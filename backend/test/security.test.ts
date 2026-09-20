import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function textFiles(root: string): string[] {
  if (!fs.existsSync(root)) return []
  const result: string[] = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory() && entry.name !== 'node_modules') result.push(...textFiles(fullPath))
    if (entry.isFile() && /\.(js|jsx|ts|tsx|json|html|css|mjs|md)$/u.test(entry.name)) result.push(fullPath)
  }
  return result
}

describe('frontend secret boundary', () => {
  it('contains no API key assignment or real-looking OpenAI key in frontend artifacts', () => {
    const repoRoot = path.resolve(import.meta.dirname, '../..')
    const frontendRoots = ['src', 'public', 'dist'].map((directory) => path.join(repoRoot, directory))
    const content = frontendRoots.flatMap(textFiles).map((filePath) => fs.readFileSync(filePath, 'utf8')).join('\n')
    expect(content).not.toMatch(/OPENAI_API_KEY\s*=/u)
    expect(content).not.toMatch(/sk-[A-Za-z0-9]{20,}/u)
  })
})
