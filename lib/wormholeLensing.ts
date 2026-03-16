/**
 * @fileoverview Gravitational Lensing Simulation for Wormhole Spacetime
 *
 * Computes gravitational lensing effects produced by the wormhole on
 * background stars and galaxies.
 *
 * ── Lensing Geometry ──────────────────────────────────────────────────────────
 *
 * Standard lensing setup:
 *
 *   Observer ←─── D_L ───→ Wormhole ←─── D_LS ───→ Source
 *   └──────────────────── D_S ──────────────────────┘
 *
 * Lens equation (angular positions):
 *   β = θ − (D_LS/D_S) · α̂(D_L · θ)
 *
 * where:
 *   β  = true source position [rad]
 *   θ  = image position [rad]
 *   α̂  = deflection angle as function of impact parameter
 *
 * ── Wormhole Lensing ──────────────────────────────────────────────────────────
 *
 * A wormhole acts as a lens with deflection:
 *   α(b) = 2∫dl / [r(l)√(r²(l)/b² − 1)] − π
 *
 * Unlike a black hole:
 *   • The wormhole does NOT have an event horizon
 *   • Photons with b < b₀ pass through to the other side
 *   • The lensing creates both real (positive) and virtual images
 *   • Photons from the other region can exit through the wormhole
 *
 * References:
 *   Cramer et al. (1995) Phys. Rev. D 51, 3117 — negative mass lensing
 *   Abe (2010) ApJ 725, 787 — wormhole microlensing
 *   Nakajima & Asada (2012) Phys. Rev. D 85, 107501
 */

import type { StarData, GalaxyData, LensingResult } from "@/types/wormhole"
import {
  deflectionAngle,
  criticalImpactParameter,
  radialCoordinate,
  lensingImagePositions,
  lensingMagnification,
} from "./wormholePhysics"

// ─── Einstein Radius ──────────────────────────────────────────────────────────

/**
 * Einstein ring radius for a wormhole lens.
 *
 * Derived from the lensing geometry: θ_E = √(b₀ · D_LS / (D_L · D_S))
 *
 * For simplicity (equal distances D_L = D_S = D):
 *   θ_E = √(b₀ / D)
 *
 * @param b0         Throat radius [m]
 * @param distanceLM Observer-to-lens distance [m]
 * @param distanceSM Lens-to-source distance [m]
 * @param distanceTM Observer-to-source distance [m]
 */
export function einsteinRadius(
  b0: number,
  distanceLM: number,
  distanceSM: number,
  distanceTM: number
): number {
  return Math.sqrt((b0 * distanceSM) / (distanceLM * distanceTM))
}

/**
 * Angular Einstein radius for a simplified equal-distance geometry.
 */
export function einsteinRadiusSimplified(b0: number, distanceM: number): number {
  return Math.sqrt(b0 / distanceM)
}

// ─── Lensing Computation ──────────────────────────────────────────────────────

/**
 * Compute complete lensing properties for a source at angular position beta.
 *
 * @param beta         True source angular position [rad]
 * @param b0           Throat radius [m]
 * @param observerDist Observer-to-wormhole distance [m]
 */
export function computeLensing(
  beta: number,
  b0: number,
  observerDist: number
): LensingResult {
  const thetaE = einsteinRadiusSimplified(b0, observerDist)
  const { thetaPlus, thetaMinus } = lensingImagePositions(beta, b0, observerDist)
  const { muPlus, muMinus, totalMu } = lensingMagnification(beta, thetaE)

  return {
    trueAngle: beta,
    imagePlus: thetaPlus,
    imageMinus: thetaMinus,
    muPlus,
    muMinus,
    totalMagnification: totalMu,
    einsteinRadius: thetaE,
  }
}

// ─── Star Lensing ─────────────────────────────────────────────────────────────

/**
 * Apply gravitational lensing distortion to a catalog of stars.
 *
 * For each star, computes the angular displacement caused by the wormhole
 * and updates the star's apparent position and brightness.
 *
 * @param stars        Input star catalog
 * @param b0           Throat radius [render units]
 * @param wormholePos  Wormhole position in render units {x, y, z}
 * @param observerDist Observer-to-wormhole distance [render units]
 */
export function applyLensingToStars(
  stars: StarData[],
  b0: number,
  wormholePos: { x: number; y: number; z: number },
  observerDist: number
): StarData[] {
  const thetaE = einsteinRadiusSimplified(b0, observerDist)

  return stars.map((star) => {
    // Angular separation from wormhole (in sky plane)
    const dRA = ((star.ra - (wormholePos.x * 180) / Math.PI) * Math.PI) / 180
    const dDec = ((star.dec - (wormholePos.y * 180) / Math.PI) * Math.PI) / 180
    const beta = Math.sqrt(dRA * dRA + dDec * dDec)

    if (beta < 1e-10) {
      // Star behind the wormhole: Einstein ring
      return {
        ...star,
        magnification: 1e3, // Very high magnification
        lensedRA: star.ra + thetaE * (180 / Math.PI),
        lensedDec: star.dec,
      }
    }

    const u = beta / thetaE
    const { muPlus, totalMu } = lensingMagnification(beta, thetaE)
    const { thetaPlus } = lensingImagePositions(beta, b0, observerDist)

    // Scale factor to shift apparent position
    const scaleFactor = thetaPlus / beta

    return {
      ...star,
      magnification: totalMu,
      lensedRA: wormholePos.x + (star.ra - wormholePos.x) * scaleFactor,
      lensedDec: wormholePos.y + (star.dec - wormholePos.y) * scaleFactor,
    }
  })
}

// ─── Galaxy Lensing ───────────────────────────────────────────────────────────

/**
 * Apply gravitational lensing to a galaxy catalog.
 * High-redshift galaxies behind the wormhole are magnified and distorted.
 *
 * @param galaxies     Input galaxy catalog
 * @param b0           Throat radius [render units]
 * @param observerDist Observer distance [render units]
 */
export function applyLensingToGalaxies(
  galaxies: GalaxyData[],
  b0: number,
  observerDist: number
): GalaxyData[] {
  const thetaE = einsteinRadiusSimplified(b0, observerDist)

  return galaxies.map((galaxy) => {
    const beta = Math.sqrt(
      (galaxy.ra * Math.PI / 180) ** 2 + (galaxy.dec * Math.PI / 180) ** 2
    )
    if (beta < 1e-10) return { ...galaxy, magnification: 1 }

    const { totalMu } = lensingMagnification(beta, thetaE)
    return { ...galaxy, magnification: totalMu }
  })
}

// ─── Deflection Map ───────────────────────────────────────────────────────────

/**
 * Generate a 2D deflection field for the wormhole lens.
 *
 * Returns a grid of (Δθ_x, Δθ_y) displacement vectors showing how the
 * wormhole bends light across the sky plane.
 *
 * @param b0          Throat radius [m]
 * @param fieldSize   Angular field size [rad]
 * @param resolution  Grid resolution (N × N)
 * @param observerDist Observer distance [m]
 */
export function generateDeflectionField(
  b0: number,
  fieldSize: number,
  resolution: number,
  observerDist: number
): Array<{
  thetaX: number
  thetaY: number
  deflX: number
  deflY: number
  magnitude: number
}> {
  const field: Array<{
    thetaX: number
    thetaY: number
    deflX: number
    deflY: number
    magnitude: number
  }> = []

  const step = fieldSize / resolution
  const halfField = fieldSize / 2

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const thetaX = -halfField + i * step
      const thetaY = -halfField + j * step
      const theta = Math.sqrt(thetaX * thetaX + thetaY * thetaY)

      if (theta < 1e-12) {
        field.push({ thetaX, thetaY, deflX: 0, deflY: 0, magnitude: 0 })
        continue
      }

      // Impact parameter
      const bImpact = theta * observerDist
      const alpha = bImpact > b0
        ? deflectionAngle(bImpact, b0)
        : -Math.PI

      const magnitude = Math.abs(alpha)
      const deflX = (thetaX / theta) * alpha
      const deflY = (thetaY / theta) * alpha

      field.push({ thetaX, thetaY, deflX, deflY, magnitude })
    }
  }

  return field
}

// ─── Photon Ring Prediction ────────────────────────────────────────────────────

/**
 * Predict the angular radii of photon rings produced by the wormhole.
 *
 * Near the critical impact parameter, photons wind many times around the
 * wormhole throat before escaping, producing a series of photon rings.
 *
 * Ring n has impact parameter:
 *   b_n ≈ b_c + Δb · exp(−nπ)
 *
 * where Δb is the width of the photon ring in impact parameter space.
 *
 * @param b0          Throat radius [m]
 * @param observerDist Distance to wormhole [m]
 * @param nRings      Number of photon rings to compute
 */
export function photonRingAngles(
  b0: number,
  observerDist: number,
  nRings: number = 4
): Array<{ n: number; angularRadius: number; relativeFlux: number }> {
  const bc = criticalImpactParameter(b0)

  return Array.from({ length: nRings }, (_, n) => {
    const deltaB = bc * 0.01 // Ring width as 1% of critical parameter
    const bn = bc + deltaB * Math.exp(-n * Math.PI)
    const thetaN = bn / observerDist
    const relativeFlux = Math.exp(-n * Math.PI) // Geometric series: each ring dimmer

    return { n: n + 1, angularRadius: thetaN, relativeFlux }
  })
}

// ─── Wormhole Image Positions ──────────────────────────────────────────────────

/**
 * For a given source in region B of the wormhole, compute where an observer
 * in region A would see the source's "wormhole image."
 *
 * Sources beyond the throat appear as if they are located at the throat
 * position with an angular size determined by the wormhole solid angle.
 *
 * @param sourceDist    Source distance from throat [m]
 * @param b0            Throat radius [m]
 * @param observerDist  Observer distance from throat [m]
 */
export function wormholeImagePosition(
  sourceDist: number,
  b0: number,
  observerDist: number
): {
  angularRadius: number
  magnification: number
  solidAngle: number
} {
  // Solid angle subtended by the wormhole throat as seen from observer
  const angularRadius = b0 / observerDist // [rad]
  const solidAngle = Math.PI * angularRadius * angularRadius

  // Area of the wormhole mouth / area of source sphere at source distance
  const magnification = (observerDist / sourceDist) ** 2

  return { angularRadius, magnification, solidAngle }
}
