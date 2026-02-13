export type RingDefinition = {
  name: string
  innerKm: number
  outerKm: number
  color: string
  opacity: number
}

export type PlanetRings = {
  planet: "Jupiter" | "Saturn" | "Uranus" | "Neptune"
  rings: RingDefinition[]
}

export const ringSystems: PlanetRings[] = [
  {
    planet: "Jupiter",
    rings: [
      { name: "Halo", innerKm: 89400, outerKm: 123000, color: "#94a3b8", opacity: 0.12 },
      { name: "Main", innerKm: 123000, outerKm: 128940, color: "#cbd5f5", opacity: 0.22 },
      { name: "Amalthea", innerKm: 128940, outerKm: 181350, color: "#94a3b8", opacity: 0.12 },
      { name: "Thebe", innerKm: 181350, outerKm: 221900, color: "#7f8ea3", opacity: 0.1 },
      { name: "Thebe Ext.", innerKm: 221900, outerKm: 280000, color: "#64748b", opacity: 0.08 },
    ],
  },
  {
    planet: "Saturn",
    rings: [
      { name: "D", innerKm: 66900, outerKm: 74510, color: "#cbd5f5", opacity: 0.08 },
      { name: "C", innerKm: 74658, outerKm: 91975, color: "#e2e8f0", opacity: 0.12 },
      { name: "B", innerKm: 91975, outerKm: 117507, color: "#f8fafc", opacity: 0.18 },
      { name: "A", innerKm: 122340, outerKm: 136780, color: "#e2e8f0", opacity: 0.16 },
      { name: "F", innerKm: 139800, outerKm: 140300, color: "#fef3c7", opacity: 0.18 },
      { name: "G", innerKm: 166000, outerKm: 173000, color: "#cbd5f5", opacity: 0.1 },
      { name: "E", innerKm: 180000, outerKm: 480000, color: "#94a3b8", opacity: 0.06 },
    ],
  },
  {
    planet: "Uranus",
    rings: [
      { name: "6", innerKm: 41836, outerKm: 41838, color: "#cbd5f5", opacity: 0.2 },
      { name: "5", innerKm: 42233, outerKm: 42235, color: "#cbd5f5", opacity: 0.2 },
      { name: "4", innerKm: 42570, outerKm: 42572, color: "#cbd5f5", opacity: 0.2 },
      { name: "Alpha", innerKm: 44713, outerKm: 44723, color: "#e2e8f0", opacity: 0.22 },
      { name: "Beta", innerKm: 45655, outerKm: 45667, color: "#e2e8f0", opacity: 0.22 },
      { name: "Eta", innerKm: 47175, outerKm: 47177, color: "#e2e8f0", opacity: 0.18 },
      { name: "Gamma", innerKm: 47625, outerKm: 47629, color: "#e2e8f0", opacity: 0.2 },
      { name: "Delta", innerKm: 48296, outerKm: 48304, color: "#e2e8f0", opacity: 0.18 },
      { name: "Lambda", innerKm: 50023, outerKm: 50025, color: "#e2e8f0", opacity: 0.16 },
      { name: "Epsilon", innerKm: 51100, outerKm: 51200, color: "#f8fafc", opacity: 0.24 },
      { name: "R/2003 U2", innerKm: 65300, outerKm: 68300, color: "#94a3b8", opacity: 0.1 },
      { name: "R/2003 U1", innerKm: 89300, outerKm: 106300, color: "#64748b", opacity: 0.08 },
    ],
  },
  {
    planet: "Neptune",
    rings: [
      { name: "Galle", innerKm: 40900, outerKm: 42900, color: "#cbd5f5", opacity: 0.12 },
      { name: "LeVerrier", innerKm: 53200, outerKm: 53300, color: "#e2e8f0", opacity: 0.12 },
      { name: "Lassell", innerKm: 55300, outerKm: 57100, color: "#94a3b8", opacity: 0.1 },
      { name: "Arago", innerKm: 57200, outerKm: 57300, color: "#94a3b8", opacity: 0.1 },
      { name: "Adams", innerKm: 62930, outerKm: 63650, color: "#f8fafc", opacity: 0.14 },
    ],
  },
]
