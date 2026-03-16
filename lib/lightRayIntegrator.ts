/**
 * @fileoverview Light Ray Integrator for Wormhole Spacetime
 *
 * Numerically integrates null geodesics in the Morris–Thorne wormhole metric
 * using a 4th-order Runge–Kutta (RK4) scheme.
 *
 * ── Equations of Motion ───────────────────────────────────────────────────────
 *
 * Working in the equatorial plane (θ = π/2) of the Ellis wormhole:
 *
 *   ds² = −c²dt²  +  dl²  +  r²(l)(dφ²)    where r(l) = √(b₀² + l²)
 *
 * Two conserved quantities:
 *   E = c² dt/dλ     (energy per unit mass)
 *   L = r²(l) dφ/dλ  (angular momentum)
 *
 * Null geodesic condition (dl/dφ)² = r²(l) [r²(l)/b² − 1]
 * where b = L/E (impact parameter), b₀ = throat radius.
 *
 * Second-order ODE in (l, φ):
 *   d²l/dφ² = l · [2r²(l)/b² − 1]
 *           = l · [2(b₀² + l²)/b² − 1]
 *
 * ── Integration Strategy ──────────────────────────────────────────────────────
 *
 * State vector: [l, l'] = [l, dl/dφ]
 * RHS: f([l, l'], b) = [l', l·(2(b₀²+l²)/b² − 1)]
 *
 * Integration runs until:
 *   • Photon reaches numerical infinity (|l| > L_max)
 *   • Photon completes a throat crossing
 *   • Maximum integration steps exceeded
 *
 * References:
 *   Morris & Thorne (1988), §VI
 *   Müller (2008) Am. J. Phys. 76, 1024 (wormhole ray tracing)
 */

import type { LightRayState, LightRayTrajectory, RayOutcome } from "@/types/wormhole"
import { radialCoordinate } from "./wormholePhysics"

// ─── Integrator Configuration ─────────────────────────────────────────────────

export interface IntegratorSettings {
  /** Wormhole throat radius b₀ [m] */
  throatRadius: number
  /** Impact parameter b [m] */
  impactParameter: number
  /** Maximum |l| before declaring escape [m] */
  lMax: number
  /** Step size in φ [rad] */
  dPhi: number
  /** Maximum number of integration steps */
  maxSteps: number
  /** Initial proper distance (start of integration) [m] */
  l0: number
  /** Initial dl/dφ (sign determines direction of approach) */
  dlDphi0: number
}

// ─── RK4 Core ─────────────────────────────────────────────────────────────────

/**
 * Right-hand side of the geodesic ODE.
 *
 *   d[l, l']/dφ = [l', l·(2r²/b² − 1)]
 */
function rhs(l: number, lPrime: number, b: number, b0: number): [number, number] {
  const r2 = b0 * b0 + l * l
  const lDoublePrime = l * (2 * r2 / (b * b) - 1)
  return [lPrime, lDoublePrime]
}

/**
 * Single RK4 step.
 *
 * @param l      Current proper distance [m]
 * @param lPrime Current dl/dφ
 * @param b      Impact parameter [m]
 * @param b0     Throat radius [m]
 * @param dPhi   Step size [rad]
 * @returns      [l_new, lPrime_new]
 */
function rk4Step(
  l: number,
  lPrime: number,
  b: number,
  b0: number,
  dPhi: number
): [number, number] {
  const [k1l, k1p] = rhs(l, lPrime, b, b0)

  const l2 = l + 0.5 * dPhi * k1l
  const p2 = lPrime + 0.5 * dPhi * k1p
  const [k2l, k2p] = rhs(l2, p2, b, b0)

  const l3 = l + 0.5 * dPhi * k2l
  const p3 = lPrime + 0.5 * dPhi * k2p
  const [k3l, k3p] = rhs(l3, p3, b, b0)

  const l4 = l + dPhi * k3l
  const p4 = lPrime + dPhi * k3p
  const [k4l, k4p] = rhs(l4, p4, b, b0)

  return [
    l + (dPhi / 6) * (k1l + 2 * k2l + 2 * k3l + k4l),
    lPrime + (dPhi / 6) * (k1p + 2 * k2p + 2 * k3p + k4p),
  ]
}

// ─── Main Integrator ──────────────────────────────────────────────────────────

/**
 * Integrate a single null geodesic through the wormhole spacetime.
 *
 * The photon starts at l = −lMax (far side A) traveling toward the throat.
 * We integrate forward in φ until the photon escapes or exceeds maxSteps.
 *
 * @returns LightRayState array (the integrated path)
 */
export function integrateNullGeodesic(
  settings: IntegratorSettings
): { path: LightRayState[]; outcome: RayOutcome; deflectionAngle: number } {
  const { throatRadius: b0, impactParameter: b, lMax, dPhi, maxSteps } = settings

  let l = settings.l0
  let lPrime = settings.dlDphi0
  let phi = 0

  const path: LightRayState[] = []
  let throatCrossings = 0
  let prevSign = Math.sign(l)
  let outcome: RayOutcome = "escaped"

  for (let step = 0; step < maxSteps; step++) {
    const r = radialCoordinate(l, b0)
    const region: "A" | "B" = l <= 0 ? "A" : "B"

    path.push({ l, phi, dlDphi: lPrime, r, region, throatCrossings })

    // Throat crossing detection (sign change of l)
    const newSign = Math.sign(l)
    if (step > 0 && newSign !== prevSign && prevSign !== 0) {
      throatCrossings++
      if (throatCrossings >= 1) {
        outcome = "passed_through"
      }
    }
    prevSign = newSign

    // Escape condition
    if (Math.abs(l) > lMax) {
      if (throatCrossings > 0) {
        outcome = "passed_through"
      } else if (Math.abs(deflectionEstimate(l, phi)) > 0.5) {
        outcome = "deflected"
      } else {
        outcome = "escaped"
      }
      break
    }

    // Orbiting detection (many throat crossings without escape)
    if (throatCrossings > 4) {
      outcome = "orbiting"
      break
    }

    // RK4 integration step
    const [lNew, lPrimeNew] = rk4Step(l, lPrime, b, b0, dPhi)
    l = lNew
    lPrime = lPrimeNew
    phi += dPhi

    // Prevent infinite integration
    if (step === maxSteps - 1) outcome = "escaped"
  }

  const lastPhi = path.length > 0 ? path[path.length - 1].phi : 0
  const deflection = lastPhi - Math.PI // deviation from straight-line

  return { path, outcome, deflectionAngle: deflection }
}

/** Rough deflection estimate from current state */
function deflectionEstimate(l: number, phi: number): number {
  return phi - Math.sign(l) * Math.PI
}

// ─── Trajectory Generator ─────────────────────────────────────────────────────

/**
 * Ray color scheme based on outcome and impact parameter.
 */
const RAY_COLORS: Record<RayOutcome, string> = {
  passed_through: "#00ffe0",  // Bright cyan-green — passed through wormhole
  orbiting:       "#ffaa00",  // Bright orange     — circling at throat
  deflected:      "#55aaff",  // Bright blue       — deflected back
  escaped:        "#ccddff",  // Bright light blue — weakly deflected
}

/**
 * Generate a set of light ray trajectories for visualization.
 *
 * Produces rays with logarithmically-spaced impact parameters, concentrating
 * samples near the critical impact parameter b_c = b₀.
 *
 * @param b0          Throat radius [m]
 * @param count       Number of rays to generate
 * @param scale       Coordinate scale for rendering (render units per meter)
 */
export function generateLightRayTrajectories(
  b0: number,
  count: number,
  scale: number = 1
): LightRayTrajectory[] {
  const trajectories: LightRayTrajectory[] = []

  // Impact parameters: from 0.5·b₀ to 5·b₀ (logarithmic spacing)
  const bMin = 0.5 * b0
  const bMax = 5.0 * b0
  const lMax = 8 * b0
  const dPhi = 0.005
  const maxSteps = 8000

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    // Logarithmic spacing concentrates rays near critical impact parameter
    const b = bMin * Math.pow(bMax / bMin, t)

    // Start far from the wormhole on side A (l = −lMax, incoming)
    const l0 = -lMax
    // Initial direction: dl/dφ > 0 means moving toward throat
    const dlDphi0 = Math.sqrt(
      Math.max(0, (b0 * b0 + l0 * l0) * ((b0 * b0 + l0 * l0) / (b * b) - 1))
    )

    if (dlDphi0 <= 0) continue

    const { path, outcome, deflectionAngle } = integrateNullGeodesic({
      throatRadius: b0,
      impactParameter: b,
      lMax,
      dPhi,
      maxSteps,
      l0,
      dlDphi0,
    })

    // Convert (l, φ) path to Cartesian 3D points
    const points = path.map(({ l, phi }) => {
      const r = radialCoordinate(l, b0) * scale
      return {
        l: l * scale,
        phi,
        x: r * Math.cos(phi),
        y: r * Math.sin(phi),
        z: 0,
      }
    })

    const bNorm = b / b0
    trajectories.push({
      impactParameter: b,
      impactParameterNorm: bNorm,
      points,
      outcome,
      deflectionAngle,
      crossedThroat: outcome === "passed_through",
      color: RAY_COLORS[outcome],
      brightness: outcome === "passed_through" ? 1.0 : 0.65,
    })
  }

  return trajectories
}

// ─── 3D Ray Generation ────────────────────────────────────────────────────────

/**
 * Generate light ray trajectories rotated around the wormhole axis.
 * This creates a 3D "ring" of rays approaching from different azimuthal angles.
 *
 * @param b0          Throat radius [m/render units]
 * @param count       Number of rays
 * @param rings       Number of azimuthal rings
 * @param scale       Coordinate scale
 */
export function generate3DLightRays(
  b0: number,
  count: number,
  rings: number = 3,
  scale: number = 1
): LightRayTrajectory[] {
  const planarRays = generateLightRayTrajectories(b0, count, scale)
  const allRays: LightRayTrajectory[] = []

  const phiOffsets = Array.from({ length: rings }, (_, i) =>
    (i * Math.PI) / rings
  )

  for (const ray of planarRays) {
    for (const phiOff of phiOffsets) {
      const rotatedPoints = ray.points.map((p) => {
        const cosA = Math.cos(phiOff)
        const sinA = Math.sin(phiOff)
        return {
          ...p,
          x: p.x * cosA - p.z * sinA,
          z: p.x * sinA + p.z * cosA,
        }
      })

      allRays.push({ ...ray, points: rotatedPoints })
    }
  }

  return allRays
}

// ─── Path Smoothing ───────────────────────────────────────────────────────────

/**
 * Downsample a ray path for rendering efficiency.
 * Keeps every Nth point to reduce vertex count.
 */
export function downsamplePath(
  points: LightRayTrajectory["points"],
  stride: number
): LightRayTrajectory["points"] {
  return points.filter((_, i) => i % stride === 0 || i === points.length - 1)
}

/**
 * Convert a set of trajectory points to a flat Float32Array
 * for use with Three.js BufferGeometry.
 */
export function trajectoryToFloat32Array(
  points: LightRayTrajectory["points"]
): Float32Array {
  const arr = new Float32Array(points.length * 3)
  for (let i = 0; i < points.length; i++) {
    arr[i * 3 + 0] = points[i].x
    arr[i * 3 + 1] = points[i].y
    arr[i * 3 + 2] = points[i].z
  }
  return arr
}
