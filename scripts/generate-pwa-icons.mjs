import { deflateSync } from 'node:zlib'
import fs from 'node:fs/promises'
import path from 'node:path'

const outputDirectory = path.resolve('public/icons')

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  return Buffer.concat([length, typeBuffer, data, checksum])
}

function createIcon(size) {
  const pixels = Buffer.alloc((size * 4 + 1) * size)
  const center = size / 2
  const accent = [101, 214, 189, 255]
  const white = [247, 250, 252, 255]
  const background = [16, 43, 61, 255]

  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1)
    pixels[row] = 0
    for (let x = 0; x < size; x += 1) {
      const index = row + 1 + x * 4
      const dx = x - center
      const dy = y - center
      const radius = Math.sqrt(dx * dx + dy * dy)
      let color = background

      // A safe-zone C mark: the opening on the right remains clear for maskable use.
      const ring = radius > size * 0.25 && radius < size * 0.34
      const opening = dx > 0 && Math.abs(dy) < size * 0.11
      if (ring && !opening) color = accent

      // A simple white numeral one inside the C.
      const oneStem = x > center + size * 0.035 && x < center + size * 0.115 && y > center - size * 0.19 && y < center + size * 0.22
      const oneTop = y > center - size * 0.19 && y < center - size * 0.11 && x > center - size * 0.02 && x < center + size * 0.115
      const oneFoot = y > center + size * 0.17 && y < center + size * 0.23 && x > center - size * 0.03 && x < center + size * 0.16
      if (oneStem || oneTop || oneFoot) color = white

      pixels[index] = color[0]
      pixels[index + 1] = color[1]
      pixels[index + 2] = color[2]
      pixels[index + 3] = color[3]
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // RGBA
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

await fs.mkdir(outputDirectory, { recursive: true })
for (const size of [192, 512]) {
  await fs.writeFile(path.join(outputDirectory, `c1-trainer-${size}.png`), createIcon(size))
}
