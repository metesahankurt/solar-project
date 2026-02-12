import fs from "fs"
import path from "path"

const inputPath = process.argv[2]
const outputPath = process.argv[3]

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/build-abellzcat.mjs <catalog.dat> <output.json>")
  process.exit(1)
}

const text = fs.readFileSync(inputPath, "utf-8")
const lines = text.split(/\r?\n/)

const C_KM_S = 299_792.458
const H0 = 70

function parseLine(line) {
  if (!line || line.length < 31) return null
  const prefix = line.slice(1, 2).trim()
  const idNum = line.slice(2, 6).trim()
  const suffix = line.slice(6, 7).trim()
  const rah = line.slice(7, 9).trim()
  const ram = line.slice(9, 12).trim()
  const decSign = line.slice(12, 13).trim() || "+"
  const ded = line.slice(13, 15).trim()
  const dem = line.slice(15, 17).trim()
  const richness = line.slice(18, 19).trim()
  const distanceClass = line.slice(19, 20).trim()
  const bm = line.slice(20, 21).trim()
  const qBm = line.slice(21, 22).trim()
  const m10 = line.slice(23, 26).trim()
  const qz = line.slice(26, 27).trim()
  const zRaw = line.slice(27, 31).trim()
  const ref = line.slice(31, 32).trim()
  const arad = line.slice(35, 39).trim()
  const logRatio = line.slice(40, 46).trim()

  if (!rah || !ram || !ded || !dem || !zRaw) return null

  const raH = Number(rah)
  const raDm = Number(ram)
  const deD = Number(ded)
  const deM = Number(dem)
  const z = Number(zRaw) * 1e-4

  if (!Number.isFinite(raH) || !Number.isFinite(raDm) || !Number.isFinite(deD) || !Number.isFinite(deM)) return null
  if (!Number.isFinite(z) || z <= 0) return null

  const raHours = raH + raDm / 600
  const raDeg = raHours * 15
  const decDeg = (decSign === "-" ? -1 : 1) * (deD + deM / 60)

  const raRad = (raDeg * Math.PI) / 180
  const decRad = (decDeg * Math.PI) / 180
  const cosDec = Math.cos(decRad)
  const x = cosDec * Math.cos(raRad)
  const y = cosDec * Math.sin(raRad)
  const zc = Math.sin(decRad)

  const distMpc = (C_KM_S / H0) * z
  const distLy = distMpc * 3_261_560

  const name = `${prefix || "A"}${idNum}${suffix}`.trim()

  return {
    id: name,
    raDeg,
    decDeg,
    vector: [x, y, zc],
    z,
    distanceMpc: distMpc,
    distanceLy: distLy,
    richness: richness ? Number(richness) : null,
    distanceClass: distanceClass ? Number(distanceClass) : null,
    bmClass: bm ? Number(bm) : null,
    bmQuality: qBm || null,
    m10: m10 ? Number(m10) / 10 : null,
    qz: qz || null,
    ref: ref || null,
    abellRadiusArcMin: arad ? Number(arad) / 10 : null,
    logZmZe: logRatio ? Number(logRatio) : null,
  }
}

const items = []
for (const line of lines) {
  const entry = parseLine(line)
  if (entry) items.push(entry)
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(items, null, 2))
console.log(`Wrote ${items.length} clusters to ${outputPath}`)
