import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2] ?? 'content/approved'
const targets = { 1: [135, 154], 2: [120, 180], 3: [120, 160], 5: [755, 785], 6: [535, 617], 7: [750, 900], 8: [620, 750] }
const files = fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? fs.readdirSync(path.join(root, entry.name)).filter((file) => file.endsWith('.json')).map((file) => path.join(root, entry.name, file)) : []).sort()
const words = (text) => text.replace(/\{\{[^}]+\}\}/gu, ' ').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/gu)?.length ?? 0
const rows = files.map((file) => {
  const item = JSON.parse(fs.readFileSync(file, 'utf8'))
  const source = item.part === 4 ? `${item.questions.length} transformations` : item.part === 7 ? [...item.content.segments.filter((segment) => segment.kind === 'text').map((segment) => segment.text), ...item.content.paragraphs.map((paragraph) => paragraph.text)].join(' ') : item.content?.text ?? item.content?.texts?.map((text) => text.text).join(' ') ?? ''
  const count = words(source)
  const range = targets[item.part]
  return { part: item.part, id: item.id, words: count, disposition: range && count < range[0] ? 'REPAIR' : 'PASS/STRUCTURAL ONLY' }
})
for (const row of rows) console.log(`${row.part}\t${row.id}\t${row.words}\t${row.disposition}`)
const grouped = new Map()
for (const row of rows) { const list = grouped.get(row.part) ?? []; list.push(row.words); grouped.set(row.part, list) }
for (const [part, values] of grouped) console.log(`PART ${part}: min=${Math.min(...values)} max=${Math.max(...values)} avg=${Math.round(values.reduce((a, b) => a + b, 0) / values.length)}`)
