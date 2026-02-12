import fs from "fs"
import path from "path"

const inputPath = process.argv[2]
const outputPath = process.argv[3]

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/build-ngc2000.mjs <input.dat> <output.json>")
  process.exit(1)
}

const text = fs.readFileSync(inputPath, "utf-8")
const lines = text.split(/\r?\n/)

function parseNumber(value) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

function parseLine(line) {
  if (!line || line.length < 30) return null
  const name = line.slice(0, 5).trim()
  if (!name) return null
  const type = line.slice(6, 9).trim() || null
  const rah = parseNumber(line.slice(10, 12))
  const ram = parseNumber(line.slice(13, 17))
  const signChar = line.slice(19, 20)
  const ded = parseNumber(line.slice(20, 22))
  const dem = parseNumber(line.slice(23, 25))
  const source = line.slice(26, 27).trim() || null
  const constellation = line.slice(29, 32).trim() || null
  const sizeLimit = line.slice(32, 33).trim() || null
  const size = parseNumber(line.slice(33, 38))
  const mag = parseNumber(line.slice(40, 44))
  const magType = line.slice(44, 45).trim() || null
  const desc = line.slice(46, 99).trim() || null

  if (rah === null || ram === null || ded === null || dem === null) return null
  const raHours = rah + ram / 60
  const raDeg = raHours * 15
  const decDeg = (signChar === "-" ? -1 : 1) * (ded + dem / 60)

  const raRad = (raDeg * Math.PI) / 180
  const decRad = (decDeg * Math.PI) / 180
  const cosDec = Math.cos(decRad)
  const x = cosDec * Math.cos(raRad)
  const y = cosDec * Math.sin(raRad)
  const z = Math.sin(decRad)

  return {
    id: name,
    type,
    raHours,
    raDeg,
    decDeg,
    vector: [x, y, z],
    source,
    constellation,
    sizeLimit,
    sizeArcMin: size,
    mag,
    magType,
    desc,
  }
}

const objects = []
for (const line of lines) {
  const obj = parseLine(line)
  if (obj) objects.push(obj)
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(objects, null, 2))
console.log(`Wrote ${objects.length} objects to ${outputPath}`)
