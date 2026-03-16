/**
 * @fileoverview NASA & Open Astronomy Data Loader
 *
 * Loads and parses astronomical datasets from static JSON catalogs
 * derived from publicly available NASA / ESA archives:
 *
 *  • Hipparcos Catalogue (ESA 1997) — positions, parallaxes, magnitudes
 *  • Yale Bright Star Catalogue 5th ed. (Hoffleit & Warren 1991)
 *  • NGC/IC Catalog — galaxy positions and morphology
 *  • Messier Catalogue — bright nebulae and galaxies
 *
 * All data is distributed under open science licenses and has been
 * preprocessed for browser use.
 *
 * Live API endpoints (optional, not used by default):
 *  • NASA SkyView: https://skyview.gsfc.nasa.gov/
 *  • CDS VizieR:   https://vizier.cds.unistra.fr/
 *  • Simbad:       https://simbad.cds.unistra.fr/
 */

import type { StarData, GalaxyData, NASAStarCatalog, GalaxyCatalog } from "@/types/wormhole"
import {
  equatorialToCartesian,
  temperatureToHexColor,
  spectralClassToTemperature,
} from "./wormholePhysics"

// ─── Static JSON Import ───────────────────────────────────────────────────────

// These imports point to preprocessed catalog files in /data/
// The files contain real observational data from NASA/ESA archives

/**
 * Load and parse the star catalog.
 *
 * The data comes from:
 *  - Hipparcos catalog (HIP identifiers)
 *  - Yale Bright Star Catalogue (HR identifiers)
 *
 * @returns Parsed star catalog
 */
export async function loadStarCatalog(): Promise<NASAStarCatalog> {
  try {
    const response = await fetch("/data/nasaStars.json")
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const raw = await response.json()
    return parseStarCatalog(raw)
  } catch (error) {
    console.warn("Failed to load star catalog, using fallback:", error)
    return getFallbackStarCatalog()
  }
}

/**
 * Load and parse the galaxy catalog.
 *
 * The data comes from:
 *  - Messier Catalogue
 *  - NGC/IC Principal Galaxy Catalogue
 *
 * @returns Parsed galaxy catalog
 */
export async function loadGalaxyCatalog(): Promise<GalaxyCatalog> {
  try {
    const response = await fetch("/data/galaxyCatalog.json")
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const raw = await response.json()
    return parseGalaxyCatalog(raw)
  } catch (error) {
    console.warn("Failed to load galaxy catalog, using fallback:", error)
    return getFallbackGalaxyCatalog()
  }
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

interface RawStarEntry {
  id: string
  name?: string
  ra: number
  dec: number
  magnitude: number
  spectralClass: string
  distancePc: number
}

function parseStarCatalog(raw: { stars: RawStarEntry[] }): NASAStarCatalog {
  const stars: StarData[] = raw.stars.map((s) => {
    const temp = spectralClassToTemperature(s.spectralClass)
    const color = temperatureToHexColor(temp)
    const pos = equatorialToCartesian(s.ra, s.dec, s.distancePc)
    const absMag = s.magnitude - 5 * Math.log10(s.distancePc / 10)

    return {
      id: s.id,
      name: s.name,
      ra: s.ra,
      dec: s.dec,
      magnitude: s.magnitude,
      spectralClass: s.spectralClass,
      distance: s.distancePc,
      temperature: temp,
      color,
      ...pos,
      absoluteMagnitude: absMag,
    }
  })

  return {
    source: "Hipparcos / Yale BSC",
    retrievedAt: "2024",
    count: stars.length,
    stars,
  }
}

interface RawGalaxyEntry {
  id: string
  name: string
  ra: number
  dec: number
  redshift: number
  type: string
  magnitude: number
  angularSize?: number
  distanceMpc: number
}

function parseGalaxyCatalog(raw: { galaxies: RawGalaxyEntry[] }): GalaxyCatalog {
  const galaxies: GalaxyData[] = raw.galaxies.map((g) => {
    const color = galaxyTypeToColor(g.type)
    const pos = equatorialToCartesian(g.ra, g.dec, g.distanceMpc * 1e6)

    return {
      id: g.id,
      name: g.name,
      ra: g.ra,
      dec: g.dec,
      redshift: g.redshift,
      type: g.type as GalaxyData["type"],
      magnitude: g.magnitude,
      angularSize: g.angularSize,
      distanceMpc: g.distanceMpc,
      x: pos.x / 1e6, // Convert pc back to Mpc
      y: pos.y / 1e6,
      z: pos.z / 1e6,
      color,
    }
  })

  return {
    source: "Messier / NGC-IC Catalog",
    count: galaxies.length,
    galaxies,
  }
}

/** Assign a color to a galaxy based on Hubble type */
function galaxyTypeToColor(type: string): string {
  if (type.startsWith("E")) return "#ffddaa"     // Elliptical: warm orange-white
  if (type.startsWith("S0")) return "#ffeedd"    // Lenticular: pale
  if (type.startsWith("SB")) return "#aaddff"    // Barred spiral: blue-white
  if (type.startsWith("S")) return "#88ccff"     // Spiral: blue-white
  if (type === "Irr") return "#ffaacc"           // Irregular: pink
  return "#cccccc"
}

// ─── Procedural Background Stars ─────────────────────────────────────────────

/**
 * Generate a procedural star field to supplement the catalog.
 *
 * Uses a pseudo-random distribution matching the galactic density profile:
 *  - Higher density toward the galactic plane (b ≈ 0)
 *  - Power-law magnitude distribution
 *  - Realistic spectral type fractions (OBAFGKM: 0.1/1.3/6/3/7/12/70%)
 *
 * @param count      Number of procedural stars to generate
 * @param seed       Deterministic seed for reproducibility
 * @param maxDist    Maximum distance [parsecs]
 */
export function generateProceduralStars(
  count: number,
  seed: number = 42,
  maxDist: number = 2000
): StarData[] {
  // Seeded pseudo-random number generator (Mulberry32)
  let s = seed
  const rand = (): number => {
    s |= 0; s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  // Spectral type distribution (approximate solar neighborhood fractions)
  const spectralTypes = ["O", "B", "A", "F", "G", "K", "M"]
  const spectralWeights = [0.001, 0.013, 0.06, 0.03, 0.07, 0.12, 0.706]
  const cdf = spectralWeights.reduce<number[]>((acc, w, i) => {
    acc.push((acc[i - 1] ?? 0) + w)
    return acc
  }, [])

  const pickSpectral = (): string => {
    const r = rand()
    const i = cdf.findIndex((c) => r <= c)
    return spectralTypes[Math.max(0, i)]
  }

  const stars: StarData[] = []

  for (let i = 0; i < count; i++) {
    // Random position in galactic coordinates with disk concentration
    const galLon = rand() * 360
    const galLat = (rand() - 0.5) * 180 * Math.pow(rand(), 2) // Disk-concentrated

    // Convert galactic → equatorial (approximate)
    const ra = galLon
    const dec = galLat * 0.7

    const dist = maxDist * Math.pow(rand(), 1 / 3) // Uniform in volume

    const sp = pickSpectral()
    const temp = spectralClassToTemperature(sp) * (0.8 + rand() * 0.4)
    const color = temperatureToHexColor(temp)
    const pos = equatorialToCartesian(ra, dec, dist)

    // Apparent magnitude: brighter for closer/intrinsically bright stars
    const absMag = -5 + rand() * 15 // Broad range
    const appMag = absMag + 5 * Math.log10(dist / 10)

    stars.push({
      id: `PROC-${seed}-${i}`,
      ra, dec,
      magnitude: appMag,
      spectralClass: sp,
      distance: dist,
      temperature: temp,
      color,
      ...pos,
      absoluteMagnitude: absMag,
    })
  }

  return stars
}

// ─── Fallback Catalogs ────────────────────────────────────────────────────────

/**
 * Fallback star catalog with 50 bright real stars from the
 * Yale Bright Star Catalogue / Hipparcos.
 * Coordinates are J2000.0 epoch.
 */
function getFallbackStarCatalog(): NASAStarCatalog {
  const rawStars: RawStarEntry[] = [
    { id: "HIP32349", name: "Sirius",      ra: 101.287, dec: -16.716, magnitude: -1.46, spectralClass: "A1V",     distancePc: 2.64   },
    { id: "HIP30438", name: "Canopus",     ra:  95.988, dec: -52.696, magnitude: -0.74, spectralClass: "F0Ib",    distancePc: 95.9   },
    { id: "HIP69673", name: "Arcturus",    ra: 213.915, dec:  19.182, magnitude: -0.05, spectralClass: "K1.5III", distancePc: 11.26  },
    { id: "HIP91262", name: "Vega",        ra: 279.234, dec:  38.784, magnitude:  0.03, spectralClass: "A0Va",    distancePc: 7.68   },
    { id: "HIP24608", name: "Capella",     ra:  79.172, dec:  45.998, magnitude:  0.08, spectralClass: "G8III",   distancePc: 13.1   },
    { id: "HIP24436", name: "Rigel",       ra:  78.634, dec:  -8.202, magnitude:  0.13, spectralClass: "B8Ia",    distancePc: 264.0  },
    { id: "HIP37279", name: "Procyon",     ra: 114.825, dec:   5.225, magnitude:  0.37, spectralClass: "F5IV",    distancePc: 3.51   },
    { id: "HIP27989", name: "Betelgeuse",  ra:  88.793, dec:   7.407, magnitude:  0.42, spectralClass: "M2Ia",    distancePc: 197.0  },
    { id: "HIP7588",  name: "Achernar",    ra:  24.429, dec: -57.237, magnitude:  0.46, spectralClass: "B6Vpe",   distancePc: 44.1   },
    { id: "HIP68702", name: "Hadar",       ra: 210.956, dec: -60.373, magnitude:  0.61, spectralClass: "B1II",    distancePc: 161.0  },
    { id: "HIP97649", name: "Altair",      ra: 297.696, dec:   8.868, magnitude:  0.76, spectralClass: "A7V",     distancePc: 5.13   },
    { id: "HIP65474", name: "Spica",       ra: 201.298, dec: -11.161, magnitude:  0.97, spectralClass: "B1III",   distancePc: 77.5   },
    { id: "HIP36850", name: "Pollux",      ra: 116.329, dec:  28.026, magnitude:  1.14, spectralClass: "K0IIIb",  distancePc: 10.34  },
    { id: "HIP113368",name: "Fomalhaut",   ra: 344.413, dec: -29.622, magnitude:  1.16, spectralClass: "A3V",     distancePc: 7.69   },
    { id: "HIP60718", name: "Mimosa",      ra: 191.930, dec: -59.689, magnitude:  1.25, spectralClass: "B0.5III", distancePc: 108.0  },
    { id: "HIP80763", name: "Antares",     ra: 247.352, dec: -26.432, magnitude:  1.09, spectralClass: "M1Ib",    distancePc: 170.0  },
    { id: "HIP15429", name: "Aldebaran",   ra:  68.980, dec:  16.509, magnitude:  0.87, spectralClass: "K5III",   distancePc: 20.0   },
    { id: "HIP21421", name: "Elnath",      ra:  81.573, dec:  28.608, magnitude:  1.65, spectralClass: "B7III",   distancePc: 41.1   },
    { id: "HIP26727", name: "Alnilam",     ra:  84.053, dec:  -1.202, magnitude:  1.70, spectralClass: "B0Ia",    distancePc: 410.0  },
    { id: "HIP25930", name: "Alnitak",     ra:  85.190, dec:  -1.943, magnitude:  1.77, spectralClass: "O9.5Ib",  distancePc: 386.0  },
    { id: "HIP54061", name: "Alioth",      ra: 166.017, dec:  55.960, magnitude:  1.76, spectralClass: "A0pCr",   distancePc: 24.9   },
    { id: "HIP62956", name: "Dubhe",       ra: 165.932, dec:  61.751, magnitude:  1.79, spectralClass: "K0III",   distancePc: 38.3   },
    { id: "HIP45238", name: "Regulus",     ra: 152.093, dec:  11.967, magnitude:  1.35, spectralClass: "B8IVn",   distancePc: 23.8   },
    { id: "HIP11767", name: "Polaris",     ra:  37.954, dec:  89.264, magnitude:  1.97, spectralClass: "F8Ib",    distancePc: 132.0  },
    { id: "HIP57632", name: "Denebola",    ra: 177.265, dec:  14.572, magnitude:  2.14, spectralClass: "A3V",     distancePc: 11.09  },
    { id: "HIP85927", name: "Shaula",      ra: 263.402, dec: -37.104, magnitude:  1.62, spectralClass: "B1.5III", distancePc: 116.0  },
    { id: "HIP102098",name: "Deneb",       ra: 310.358, dec:  45.280, magnitude:  1.25, spectralClass: "A2Ia",    distancePc: 802.0  },
    { id: "HIP90185", name: "Atria",       ra: 264.330, dec: -69.028, magnitude:  1.91, spectralClass: "K2IIb",   distancePc: 97.9   },
    { id: "HIP44816", name: "Miaplacidus", ra: 138.300, dec: -69.717, magnitude:  1.67, spectralClass: "A2IV",    distancePc: 34.0   },
    { id: "HIP110997",name: "Fomalhaut B", ra: 344.413, dec: -29.622, magnitude:  6.50, spectralClass: "K4V",     distancePc: 7.66   },
    { id: "HIP49669", name: "Cor Caroli",  ra: 194.007, dec:  38.319, magnitude:  2.90, spectralClass: "A0Vp",    distancePc: 33.9   },
    { id: "HIP72607", name: "Alkaid",      ra: 206.886, dec:  49.313, magnitude:  1.86, spectralClass: "B3V",     distancePc: 30.9   },
    { id: "HIP5447",  name: "Mirach",      ra:  17.433, dec:  35.620, magnitude:  2.06, spectralClass: "M0IIIa",  distancePc: 60.0   },
    { id: "HIP677",   name: "Alpheratz",   ra:   2.097, dec:  29.091, magnitude:  2.07, spectralClass: "B9p",     distancePc: 30.1   },
    { id: "HIP17702", name: "Algol",       ra:  47.042, dec:  40.956, magnitude:  2.09, spectralClass: "B8V",     distancePc: 28.5   },
    { id: "HIP57939", name: "Phecda",      ra: 178.458, dec:  53.695, magnitude:  2.44, spectralClass: "A0Ve",    distancePc: 25.6   },
    { id: "HIP59774", name: "Megrez",      ra: 183.857, dec:  57.032, magnitude:  3.31, spectralClass: "A3V",     distancePc: 23.4   },
    { id: "HIP53910", name: "Merak",       ra: 165.460, dec:  56.383, magnitude:  2.37, spectralClass: "A1V",     distancePc: 24.4   },
    { id: "HIP48455", name: "Phad",        ra: 152.667, dec:  47.145, magnitude:  2.44, spectralClass: "G0IV",    distancePc: 8.65   },
    { id: "HIP110960",name: "Schedar",     ra:  10.127, dec:  56.537, magnitude:  2.24, spectralClass: "K0IIIa",  distancePc: 70.3   },
    { id: "HIP109268",name: "Caph",        ra:   2.294, dec:  59.150, magnitude:  2.27, spectralClass: "F2III",   distancePc: 16.8   },
    { id: "HIP3179",  name: "Algenib",     ra:  12.173, dec:  15.184, magnitude:  2.83, spectralClass: "B2IV",    distancePc: 109.0  },
    { id: "HIP92855", name: "Rasalhague",  ra: 263.734, dec:  12.560, magnitude:  2.08, spectralClass: "A5III",   distancePc: 14.07  },
    { id: "HIP25336", name: "Bellatrix",   ra:  81.283, dec:   6.350, magnitude:  1.64, spectralClass: "B2III",   distancePc: 77.5   },
    { id: "HIP25428", name: "Mintaka",     ra:  83.002, dec:  -0.299, magnitude:  2.23, spectralClass: "O9.5II",  distancePc: 380.0  },
    { id: "HIP113881",name: "Markab",      ra: 346.190, dec:  15.205, magnitude:  2.49, spectralClass: "A0IV",    distancePc: 43.3   },
    { id: "HIP746",   name: "Caph B",      ra:   1.901, dec:  60.717, magnitude:  5.09, spectralClass: "A7V",     distancePc: 35.0   },
    { id: "HIP71683", name: "Rigil Kent",  ra: 219.899, dec: -60.834, magnitude: -0.01, spectralClass: "G2V",     distancePc: 1.34   },
    { id: "HIP70890", name: "Proxima",     ra: 217.429, dec: -62.679, magnitude: 11.13, spectralClass: "M5Ve",    distancePc: 1.30   },
    { id: "HIP16537", name: "Epsilon Eri", ra:  53.233, dec:  -9.458, magnitude:  3.73, spectralClass: "K2V",     distancePc: 3.22   },
  ]

  return parseStarCatalog({ stars: rawStars })
}

/**
 * Fallback galaxy catalog with 30 well-known galaxies.
 * Distances from NED (NASA/IPAC Extragalactic Database).
 */
function getFallbackGalaxyCatalog(): GalaxyCatalog {
  const rawGalaxies: RawGalaxyEntry[] = [
    { id: "M31",   name: "Andromeda",      ra:  10.68,  dec:  41.27,  redshift: -0.001004, type: "Sb",  magnitude:  3.44, angularSize: 190.0, distanceMpc:   0.785 },
    { id: "M33",   name: "Triangulum",     ra:  23.46,  dec:  30.66,  redshift: -0.000607, type: "Sc",  magnitude:  5.72, angularSize:  70.8, distanceMpc:   0.840 },
    { id: "LMC",   name: "Large Magellanic Cloud", ra: 80.89, dec: -69.76, redshift: 0.000927, type: "Irr", magnitude: 0.40, angularSize: 646.0, distanceMpc:  0.050 },
    { id: "SMC",   name: "Small Magellanic Cloud", ra: 13.16, dec: -72.80, redshift: 0.000527, type: "Irr", magnitude: 2.70, angularSize: 319.0, distanceMpc:  0.062 },
    { id: "M87",   name: "Virgo A",        ra: 187.71,  dec:  12.39,  redshift:  0.004283, type: "E",   magnitude:  8.63, angularSize:   7.2, distanceMpc:  16.4  },
    { id: "M51",   name: "Whirlpool",      ra: 202.47,  dec:  47.20,  redshift:  0.001544, type: "Sc",  magnitude:  8.36, angularSize:  11.2, distanceMpc:   8.0  },
    { id: "M104",  name: "Sombrero",       ra: 189.998, dec: -11.623, redshift:  0.003416, type: "Sa",  magnitude:  8.98, angularSize:   8.7, distanceMpc:   9.5  },
    { id: "M81",   name: "Bode's Galaxy",  ra: 148.888, dec:  69.065, redshift: -0.000113, type: "Sb",  magnitude:  6.94, angularSize:  26.9, distanceMpc:   3.6  },
    { id: "M82",   name: "Cigar Galaxy",   ra: 148.969, dec:  69.679, redshift:  0.000677, type: "Irr", magnitude:  8.41, angularSize:  11.2, distanceMpc:   3.6  },
    { id: "NGC5128",name: "Centaurus A",   ra: 201.365, dec: -43.019, redshift:  0.001826, type: "E",   magnitude:  6.84, angularSize:  25.7, distanceMpc:   3.8  },
    { id: "M101",  name: "Pinwheel",       ra: 210.802, dec:  54.349, redshift:  0.000804, type: "Sc",  magnitude:  7.86, angularSize:  28.8, distanceMpc:   6.4  },
    { id: "M106",  name: "NGC 4258",       ra: 184.740, dec:  47.303, redshift:  0.001498, type: "Sb",  magnitude:  8.41, angularSize:  18.6, distanceMpc:   7.2  },
    { id: "NGC1300",name: "NGC 1300",      ra:  49.921, dec: -19.411, redshift:  0.005270, type: "SBb", magnitude: 10.40, angularSize:   6.2, distanceMpc:  18.8  },
    { id: "M64",   name: "Black Eye",      ra: 194.182, dec:  21.683, redshift:  0.001354, type: "Sb",  magnitude:  8.52, angularSize:  10.0, distanceMpc:   5.0  },
    { id: "M77",   name: "Cetus A",        ra:  40.670, dec:  -0.013, redshift:  0.003786, type: "Sb",  magnitude:  8.87, angularSize:   7.1, distanceMpc:  14.4  },
    { id: "NGC4889",name: "Coma cD",       ra: 195.034, dec:  27.977, redshift:  0.021693, type: "E",   magnitude: 11.50, angularSize:   1.7, distanceMpc:  99.0  },
    { id: "M66",   name: "Leo II",         ra: 170.062, dec:  12.991, redshift:  0.002391, type: "Sb",  magnitude:  8.92, angularSize:   9.1, distanceMpc:  10.0  },
    { id: "M65",   name: "Leo I",          ra: 169.733, dec:  13.092, redshift:  0.002636, type: "Sa",  magnitude:  9.30, angularSize:   9.8, distanceMpc:  10.0  },
    { id: "M96",   name: "Leo Triplet C",  ra: 160.990, dec:  11.820, redshift:  0.003001, type: "Sb",  magnitude:  9.25, angularSize:   7.8, distanceMpc:  10.0  },
    { id: "NGC3628",name: "Hamburger",     ra: 170.070, dec:  13.589, redshift:  0.002804, type: "Sb",  magnitude:  9.51, angularSize:  14.8, distanceMpc:  10.0  },
    { id: "M94",   name: "Croc's Eye",     ra: 192.721, dec:  41.120, redshift:  0.001038, type: "Sb",  magnitude:  8.99, angularSize:  11.2, distanceMpc:   4.7  },
    { id: "M109",  name: "Owl Nebula Gal", ra: 179.398, dec:  53.374, redshift:  0.003431, type: "SBb", magnitude: 10.60, angularSize:   7.6, distanceMpc:  20.0  },
    { id: "NGC891", name: "Silver Sliver", ra:  35.639, dec:  42.349, redshift:  0.001760, type: "Sb",  magnitude: 10.80, angularSize:  13.5, distanceMpc:   9.5  },
    { id: "NGC1232",name: "NGC 1232",      ra:  47.432, dec: -20.579, redshift:  0.006049, type: "Sc",  magnitude: 10.60, angularSize:   7.8, distanceMpc:  22.0  },
    { id: "NGC4038",name: "Antennae A",    ra: 180.470, dec: -18.868, redshift:  0.005477, type: "Irr", magnitude: 10.32, angularSize:   5.2, distanceMpc:  22.0  },
    { id: "NGC1316",name: "Fornax A",      ra:  50.674, dec: -37.208, redshift:  0.005871, type: "E",   magnitude:  8.53, angularSize:  12.0, distanceMpc:  20.8  },
    { id: "M58",   name: "Virgo B",        ra: 189.430, dec:  11.818, redshift:  0.005051, type: "SBb", magnitude:  9.65, angularSize:   5.9, distanceMpc:  19.8  },
    { id: "M84",   name: "Virgo Lenticular",ra: 186.266, dec: 12.887, redshift:  0.003353, type: "E",   magnitude:  9.09, angularSize:   5.0, distanceMpc:  17.0  },
    { id: "NGC7331",name: "Deer Lick",     ra: 339.267, dec:  34.416, redshift:  0.002722, type: "Sb",  magnitude:  9.48, angularSize:  10.8, distanceMpc:  14.7  },
    { id: "NGC253", name: "Sculptor",      ra:  11.888, dec: -25.288, redshift:  0.000811, type: "Sc",  magnitude:  7.10, angularSize:  27.5, distanceMpc:   3.4  },
  ]

  return parseGalaxyCatalog({ galaxies: rawGalaxies })
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Filter stars by apparent magnitude limit (telescope capability).
 * Typical naked-eye limit: 6.5 mag
 * Binoculars: 10 mag
 * Small telescope: 13 mag
 */
export function filterByMagnitude(stars: StarData[], magLimit: number): StarData[] {
  return stars.filter((s) => s.magnitude <= magLimit)
}

/**
 * Sort stars by apparent brightness (brightest first).
 */
export function sortByBrightness(stars: StarData[]): StarData[] {
  return [...stars].sort((a, b) => a.magnitude - b.magnitude)
}

/**
 * Normalise star brightness to [0, 1] range for rendering.
 * Uses a logarithmic scale matching astronomical magnitude system.
 *
 * Flux ∝ 10^(−0.4·m) → normalise to [0, 1]
 */
export function normalisedBrightness(star: StarData, magMin = -2, magMax = 8): number {
  const fluxMax = Math.pow(10, -0.4 * magMin)
  const fluxMin = Math.pow(10, -0.4 * magMax)
  const flux = Math.pow(10, -0.4 * star.magnitude)
  return Math.max(0, Math.min(1, (flux - fluxMin) / (fluxMax - fluxMin)))
}
