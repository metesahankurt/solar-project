/**
 * @fileoverview Gravitational Lensing Physics — Schwarzschild Null Geodesics
 *
 * Computes photon trajectories in Schwarzschild spacetime using numerical
 * integration of the null geodesic equation.
 *
 * The orbit equation for light in Schwarzschild coordinates:
 *   d²u/dφ² + u = (3/2) Rs u²
 *
 * where u = Rs/r (inverse radius in units of Rs).
 *
 * This is the Binet equation for photon orbits, with the GR correction
 * term (3/2)Rs·u² (absent in Newtonian gravity).
 *
 * References:
 * - Chandrasekhar (1983). The Mathematical Theory of Black Holes.
 * - Darwin (1959). Proc. Roy. Soc. London — original numerical geodesic work.
 * - Bozza et al. (2001). General Relativistic Strong-Field Deflection.
 *
 * @module lensingPhysics
 */

import type { PhotonTrajectory } from "@/types/blackHole"
import { lightBendingAngle } from "./blackHolePhysics"

// ─────────────────────────────────────────────────────────────────────────────
// PHOTON TRAJECTORY COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum number of integration steps per photon */
const MAX_STEPS = 5000

/** Integration step size in radians */
const D_PHI = 0.005

/**
 * Integrates the Schwarzschild null geodesic (photon orbit) numerically.
 *
 * Uses the Binet-form orbit equation:
 *   d²u/dφ² = -u + (3/2) u²   [in units where Rs = 1]
 *
 * Integration via 4th-order Runge-Kutta.
 *
 * @param impactParameterInRs Impact parameter b in units of Rs
 * @param maxPhiRad Maximum integration angle [radians]
 * @returns Array of [r, phi] points in Rs units
 */
function integratePhotonOrbit(
  impactParameterInRs: number,
  maxPhiRad = Math.PI * 4
): { path: Array<[number, number]>; captured: boolean } {
  const b = impactParameterInRs
  const criticalB = (3 * Math.sqrt(3)) / 2  // ≈ 2.598 in Rs units

  if (b <= criticalB) {
    // Below critical impact parameter: photon always captured
    // Return a spiraling-in path for visualization
    const capturedPath: Array<[number, number]> = []
    let r = 20
    for (let phi = 0; phi < Math.PI * 3; phi += D_PHI * 10) {
      r = Math.max(1.01, r * (1 - 0.002))
      capturedPath.push([r, phi])
    }
    return { path: capturedPath, captured: true }
  }

  // Initial conditions:
  // Start at r_start = 50 Rs (large distance, incoming)
  // u = Rs/r = 1/50 initially, du/dphi = -sqrt(1/b² - u² + u³)
  const u0 = 1 / 50  // Start at r = 50 Rs

  // Initial du/dphi from orbit equation (incoming from right)
  // Sign: negative = approaching (du/dphi = -sqrt(1/b² - u² + u³))
  const energyTerm = 1 / (b * b)
  const potentialAtU0 = u0 * u0 * (1 - u0) // u²(1 - u) in Rs=1 units
  let duDphi = -Math.sqrt(Math.max(0, energyTerm - u0 * u0 + u0 * u0 * u0))

  let u = u0
  let phi = 0
  const path: Array<[number, number]> = [[1 / u, phi]]

  for (let step = 0; step < MAX_STEPS; step++) {
    // RK4 step for du/dphi and d²u/dphi²
    // f(u, du) = d²u/dphi² = -u + 3/2 * u²
    const k1u = duDphi
    const k1du = -u + 1.5 * u * u

    const u2 = u + 0.5 * D_PHI * k1u
    const du2 = duDphi + 0.5 * D_PHI * k1du
    const k2u = du2
    const k2du = -u2 + 1.5 * u2 * u2

    const u3 = u + 0.5 * D_PHI * k2u
    const du3 = duDphi + 0.5 * D_PHI * k2du
    const k3u = du3
    const k3du = -u3 + 1.5 * u3 * u3

    const u4 = u + D_PHI * k3u
    const du4 = duDphi + D_PHI * k3du
    const k4u = du4
    const k4du = -u4 + 1.5 * u4 * u4

    u = u + (D_PHI / 6) * (k1u + 2 * k2u + 2 * k3u + k4u)
    duDphi = duDphi + (D_PHI / 6) * (k1du + 2 * k2du + 2 * k3du + k4du)
    phi += D_PHI

    // Event horizon capture (r < 1.05 Rs)
    if (u > 1 / 1.05) {
      return { path, captured: true }
    }

    // Safety: infinite radius reached (photon escaped)
    if (u < 1e-6 && phi > 0.5) {
      path.push([1 / u, phi])
      break
    }

    // Record every few steps to limit path array size
    if (step % 3 === 0) {
      const r = 1 / u
      if (r < 200) {  // Only record finite distances
        path.push([r, phi])
      }
    }

    if (phi > maxPhiRad) break
  }

  return { path, captured: false }
}

/**
 * Converts a polar path [r, phi] to Cartesian [x, z] for visualization.
 * The black hole is at origin, rays come from +x direction.
 *
 * @param path Array of [r, phi] points
 * @param startAngle Initial angle offset [radians]
 * @returns Array of [x, z] Cartesian coordinates in Rs units
 */
function polarToCartesian(
  path: Array<[number, number]>,
  startAngle: number
): Array<[number, number]> {
  return path.map(([r, phi]) => {
    const angle = phi + startAngle
    return [r * Math.cos(angle), r * Math.sin(angle)]
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTON TRAJECTORY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a set of photon trajectories for gravitational lensing visualization.
 *
 * Creates rays with a range of impact parameters, showing:
 * - Near-miss trajectories (large deflection near photon sphere)
 * - Moderate deflection trajectories
 * - Weak-field nearly-straight paths
 * - Captured photons (impact b < b_c)
 *
 * @param count Number of photon paths to generate
 * @param rsM Schwarzschild radius [m] (unused in scaled coords, for API compat)
 * @returns Array of photon trajectories
 */
export function generatePhotonTrajectories(
  count: number,
  _rsM: number
): PhotonTrajectory[] {
  const trajectories: PhotonTrajectory[] = []
  const criticalB = (3 * Math.sqrt(3)) / 2  // ≈ 2.598 in Rs units

  // Ray colors by type
  const capturedColor = "#ff4444"
  const nearMissColor = "#ffaa00"
  const deflectedColor = "#44aaff"
  const weakFieldColor = "#88ccff"

  // Sample impact parameters from 1.5 Rs to 30 Rs
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)

    // Logarithmic spacing to get more rays near critical b
    const bMin = criticalB * 0.5  // Some captured rays
    const bMax = 30
    const b = bMin * Math.pow(bMax / bMin, t)

    const startAngle = Math.PI  // Rays come from +x direction

    const { path: polarPath, captured } = integratePhotonOrbit(b, Math.PI * 5)
    const cartPath = polarToCartesian(polarPath, startAngle)

    // Convert to 3D [x, y, z] path (flat in y=0 plane)
    const path3D = polarPath  // Store as [r, phi] for renderer

    const bending = captured ? Infinity : lightBendingAngle(b, 1)  // b in Rs units

    let color: string
    if (captured) color = capturedColor
    else if (b < criticalB * 1.5) color = nearMissColor
    else if (b < criticalB * 3) color = deflectedColor
    else color = weakFieldColor

    trajectories.push({
      id: `photon-${i}`,
      launchAngle: 0,
      impactParameter: b,
      path: polarPath,
      isCaptured: captured,
      isEscaping: !captured,
      totalBendingAngle: captured ? Infinity : bending,
      color,
    })
  }

  return trajectories
}

/**
 * Converts photon polar-coordinate path to 3D Cartesian positions
 * for Three.js rendering. Places rays in the XZ plane (y=0).
 *
 * @param trajectory Photon trajectory with [r, phi] path
 * @param verticalOffset Y-offset for displaying multiple rays spread out
 * @returns Array of [x, y, z] 3D coordinates in Rs units
 */
export function trajectoryToCartesian3D(
  trajectory: PhotonTrajectory,
  verticalOffset = 0
): Array<[number, number, number]> {
  const startAngle = Math.PI  // Rays approach from +x
  return trajectory.path.map(([r, phi]) => {
    const angle = phi + startAngle
    return [
      r * Math.cos(angle),
      verticalOffset,
      r * Math.sin(angle),
    ]
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// LENSED STAR BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the apparent angular positions of background stars
 * lensed by the black hole.
 *
 * For a star at angle β from the optical axis, the lens equation gives
 * two images at angles θ satisfying:
 *   β = θ - θ_E² / θ
 *
 * Solutions: θ± = (β ± sqrt(β² + 4θ_E²)) / 2
 *
 * @param trueAngleRad True angular position of star [radians]
 * @param einsteinRadiusRad Einstein radius [radians]
 * @returns Two apparent image positions [radians]
 */
export function lensedImagePositions(
  trueAngleRad: number,
  einsteinRadiusRad: number
): [number, number] {
  const beta = trueAngleRad
  const thetaE = einsteinRadiusRad
  const discriminant = Math.sqrt(beta * beta + 4 * thetaE * thetaE)

  const thetaPlus = (beta + discriminant) / 2
  const thetaMinus = (beta - discriminant) / 2

  return [thetaPlus, thetaMinus]
}

/**
 * Computes magnification of a lensed image.
 *
 *   μ± = ±(u² + 2) / (2u sqrt(u² + 4)) ± 1/2
 *
 * where u = β / θ_E (impact parameter in Einstein radius units)
 *
 * @param trueAngleRad True angular position
 * @param einsteinRadiusRad Einstein radius
 * @returns Total magnification
 */
export function lensingMagnification(
  trueAngleRad: number,
  einsteinRadiusRad: number
): number {
  const u = Math.abs(trueAngleRad) / einsteinRadiusRad
  if (u < 1e-6) return 32.7  // Near-perfect alignment: very large magnification
  const uSq = u * u
  return (uSq + 2) / (u * Math.sqrt(uSq + 4))
}
