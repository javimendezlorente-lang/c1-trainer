#!/usr/bin/env node
import path from 'node:path'
import { createContentValidator, findJsonFiles, validateContentFile } from './content-validator.mjs'

const requestedRoots = process.argv.slice(2).filter((argument) => argument !== '--')
const roots = requestedRoots.length > 0 ? requestedRoots : ['content/approved']
const validateSchema = await createContentValidator()
const files = []
for (const root of roots) files.push(...await findJsonFiles(path.resolve(root)))

let errorCount = 0
for (const filePath of files.sort()) {
  const errors = await validateContentFile(filePath, validateSchema)
  if (errors.length === 0) {
    console.log(`VALID ${filePath}`)
  } else {
    errorCount += errors.length
    for (const error of errors) console.error(error)
  }
}

console.log(`Checked ${files.length} content file(s).`)
if (errorCount > 0) {
  console.error(`Content validation failed with ${errorCount} error(s).`)
  process.exitCode = 1
}
