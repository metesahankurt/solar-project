/**
 * @fileoverview Morris–Thorne Traversable Wormhole Physics Engine
 *
 * Implements the spacetime geometry and physical properties of a traversable
 * wormhole, following the framework of Morris & Thorne (1988).
 *
 * ── Metric ────────────────────────────────────────────────────────────────────
 *
 * The general static, spherically-symmetric wormhole metric:
 *
 *   ds² = −e^(2Φ(l)) c² dt²  +  dl²  +  r(l)²(dθ² + sin²θ dφ²)
 *
 * where:
 *   l  = proper radial coordinate  (−∞ < l < +∞)
 *   r(l)  = radial coordinate = √(b₀² + l²)   for zero-tidal-force case
 *   Φ(l)  = redshift function (Φ = 0 → no tidal force, no event horizon)
 *   b₀ = throat radius  (minimum value of r, at l = 0)
 *
 * ── Shape Function ────────────────────────────────────────────────────────────
 *
 * The shape function b(r) satisfies:
 *   • b(r₀) = r₀           at the throat
 *   • b'(r₀) < 1           flaring-out condition (keeps throat open)
 *   • b(r)/r → 0 as r→∞    asymptotic flatness
 *
 * For the Ellis / zero-tidal-force wormhole: b(r) = b₀ = const.
 *
 * References:
 *   Morris & Thorne (1988) Am. J. Phys. 56, 395
 *   Ellis (1973) J. Math. Phys. 14, 104
 *   Visser (1995) "Lorentzian Wormholes"
 */

import type {
  WormholeParameters,
  WormholeGeometry,
  PhysicsMetrics,
  EmbeddingPoint,
} from "@/types/wormhole"

// ─── Physical Constants (CODATA 2018 / IAU 2015) ─────────────────────────────

export const CONSTANTS = {
  /** Speed of light [m/s] */
  c: 2.99792458e8,
  /** Gravitational constant [m³ kg⁻¹ s⁻²] */
  G: 6.67430e-11,
  /** Reduced Planck constant [J·s] */
  hBar: 1.054571817e-34,
  /** Boltzmann constant [J/K] */
  kB: 1.380649e-23,
  /** Solar radius [m] */
  SOLAR_RADIUS: 6.957e8,
  /** Solar mass [kg] */
  SOLAR_MASS: 1.989e30,
  /** Astronomical unit [m] */
  AU: 1.496e11,
  /** Light year [m] */
  LY: 9.461e15,
  /** Parsec [m] */
  PARSEC: 3.0857e16,
  /** Year [s] */
  YEAR: 3.15576e7,
} as const

// ─── Shape Functions ──────────────────────────────────────────────────────────

/**
 * Ellis wormhole shape function: b(r) = b₀ (constant).
 *
 * This is the simplest traversable wormhole with:
 *   • Zero tidal forces  (Φ = 0)
 *   • Exotic matter required at the throat
 *   • Photon sphere at r = b₀
 *
 * b'(r₀) = 0 < 1  ✓ flaring-out condition satisfied
 */
export function shapeFunctionEllis(r: number, b0: number): number {
  void r // b is independent of r for the Ellis wormhole
  return b0
}

/**
 * Power-law shape function: b(r) = b₀ · (b₀/r)^(n-1)
 *
 * For n = 2: b(r) = b₀²/r
 * Flaring-out: b'(r₀) = -(n-1) < 0 < 1 for n > 1  ✓
 */
export function shapeFunctionPowerLaw(r: number, b0: number, n = 2): number {
  return b0 * Math.pow(b0 / r, n - 1)
}

/**
 * Derivative of the shape function b'(r) for the Ellis wormhole.
 * Always zero → strong flaring-out condition is satisfied.
 */
export function shapeFunctionDerivative(_r: number, _b0: number): number {
  return 0 // For Ellis wormhole
}

// ─── Radial Coordinate ────────────────────────────────────────────────────────

/**
 * Radial coordinate r as a function of proper distance l.
 *
 *   r(l) = √(b₀² + l²)
 *
 * This is the exact form for the Ellis / zero-tidal-force wormhole.
 * At the throat (l = 0): r = b₀
 * Far from throat (|l| → ∞): r → |l|  (asymptotically flat)
 */
export function radialCoordinate(l: number, b0: number): number {
  return Math.sqrt(b0 * b0 + l * l)
}

/**
 * Proper distance l from the throat to radial coordinate r.
 *
 *   l = ±√(r² − b₀²)
 *
 * Returns the non-negative value (radial symmetry of both sides).
 */
export function properDistance(r: number, b0: number): number {
  if (r < b0) return 0
  return Math.sqrt(r * r - b0 * b0)
}

/**
 * Derivative dr/dl = l / r(l).
 * Equals 0 at the throat and approaches ±1 as |l| → ∞.
 */
export function drDl(l: number, b0: number): number {
  const r = radialCoordinate(l, b0)
  return l / r
}

// ─── Embedding Diagram ────────────────────────────────────────────────────────

/**
 * Embedding height z(r) of the wormhole throat in a flat 3-space.
 *
 * The embedding surface is obtained by "cutting" the t = const,
 * θ = π/2 slice of the metric and embedding it in flat ℝ³.
 *
 * Differential equation: (dz/dr)² = 1 / (r/b(r) − 1)
 *
 * For Ellis wormhole b(r) = b₀:
 *   dz/dr = ±1 / √(r²/b₀² − 1)
 *   z(r)  = ±b₀ · arccosh(r/b₀)  = ±b₀ · ln(r/b₀ + √((r/b₀)² − 1))
 *
 * This produces the characteristic "flared tube" / catenoid shape.
 */
export function embeddingZ(r: number, b0: number): number {
  if (r <= b0) return 0
  const u = r / b0
  return b0 * Math.log(u + Math.sqrt(u * u - 1))
}

/**
 * Generate a full 3D embedding surface as an array of parametric points.
 * Returns points for both sides (z > 0 = region B, z < 0 = region A).
 *
 * @param b0      Throat radius [m]
 * @param rMax    Maximum radial extent to visualize [m]
 * @param numR    Number of radial samples per side
 * @param numPhi  Number of azimuthal samples
 */
export function generateEmbeddingSurface(
  b0: number,
  rMax: number,
  numR: number,
  numPhi: number
): EmbeddingPoint[] {
  const points: EmbeddingPoint[] = []

  // Quadratic spacing — more resolution near the throat
  const rValues: number[] = []
  for (let i = 0; i < numR; i++) {
    const t = i / (numR - 1)
    rValues.push(b0 + (rMax - b0) * t * t)
  }

  for (const side of [-1, 1]) {
    for (let ir = 0; ir < numR; ir++) {
      const r = rValues[ir]
      const z = side * embeddingZ(r, b0)

      for (let iphi = 0; iphi < numPhi; iphi++) {
        const phi = (2 * Math.PI * iphi) / numPhi
        points.push({
          r,
          z,
          phi,
          x: r * Math.cos(phi),
          y: r * Math.sin(phi),
          zCoord: z,
        })
      }
    }
  }

  return points
}

// ─── Photon Effective Potential ───────────────────────────────────────────────

/**
 * Effective potential for photon orbits in Morris–Thorne spacetime.
 *
 *   V_eff(l) = L² / r²(l)  =  L² / (b₀² + l²)
 *
 * Properties:
 *   • Maximum at l = 0  (the throat): V_max = L² / b₀²
 *   • Photons with E² < V_max are reflected (b > b₀)
 *   • Photons with E² > V_max pass through (b < b₀)
 *   • b_critical = b₀  (unlike Schwarzschild where b_c = 3√3/2 · Rs)
 *
 * @param l               Proper distance [m]
 * @param b0              Throat radius [m]
 * @param angularMomentum Specific angular momentum L [m²/s]
 */
export function photonEffectivePotential(
  l: number,
  b0: number,
  angularMomentum: number
): number {
  const r = radialCoordinate(l, b0)
  return (angularMomentum * angularMomentum) / (r * r)
}

/**
 * Critical impact parameter for the wormhole photon sphere.
 *
 * For the Ellis wormhole: b_c = b₀
 *
 * Compare with Schwarzschild black hole: b_c = 3√3/2 · Rs ≈ 2.598 Rs
 * The wormhole photon sphere is exactly at the throat.
 */
export function criticalImpactParameter(b0: number): number {
  return b0
}

/**
 * Second derivative of effective potential at the throat (stability).
 * V''(l=0) = -2L²/b₀⁴ < 0 → photon orbit at throat is UNSTABLE.
 */
export function photonOrbitStability(b0: number, angularMomentum: number): number {
  const L2 = angularMomentum * angularMomentum
  return (-2 * L2) / (b0 * b0 * b0 * b0)
}

// ─── Light Deflection ─────────────────────────────────────────────────────────

/**
 * Deflection angle for a photon with impact parameter b > b₀.
 *
 * For the Ellis wormhole (Φ = 0, b(r) = b₀):
 *
 *   α(b) = 2 ∫[l_min → ∞] dl / [r(l) · √(r²(l)/b² − 1)] − π
 *
 * where l_min = √(b² − b₀²) is the turning point.
 *
 * The integral is evaluated numerically using composite Simpson's rule.
 * For b → b₀⁺ the deflection angle → +∞ (strong lensing regime).
 * For b → ∞ the deflection angle → 0 (geometric optics limit).
 *
 * @param b   Impact parameter [m]
 * @param b0  Throat radius [m]
 * @returns   Deflection angle [rad], negative = defocusing (pass-through)
 */
export function deflectionAngle(b: number, b0: number): number {
  if (b < b0 * (1 + 1e-9)) {
    // Photon passes through the throat — deflection is −π (direction reversal)
    return -Math.PI
  }

  // Turning point in proper distance
  const lMin = Math.sqrt(b * b - b0 * b0)
  const lMax = 40 * b // Far-field cutoff

  // Composite Simpson's rule with N panels
  const N = 512
  const dl = (lMax - lMin) / N

  const integrand = (l: number): number => {
    const r = radialCoordinate(l, b0)
    const disc = (r * r) / (b * b) - 1
    if (disc < 1e-12) return 0
    return 1 / (r * Math.sqrt(disc))
  }

  let sum = integrand(lMin + 1e-8) + integrand(lMax)
  for (let i = 1; i < N; i++) {
    const l = lMin + i * dl
    sum += (i % 2 === 0 ? 2 : 4) * integrand(l)
  }
  const integral = (sum * dl) / 3

  return 2 * integral - Math.PI
}

/**
 * Approximate weak-field deflection angle (b >> b₀).
 * Analogous to the Schwarzschild result but using the wormhole geometry.
 *
 *   α_weak ≈ π · b₀² / (2b²)
 */
export function deflectionAngleWeakField(b: number, b0: number): number {
  return (Math.PI * b0 * b0) / (2 * b * b)
}

// ─── Lensing ──────────────────────────────────────────────────────────────────

/**
 * Apparent angular positions of lensed images for a point source.
 *
 * Lens equation for a symmetric wormhole lens:
 *   β = θ − α(θ · D_L) · D_LS / (D_S · D_L)
 *
 * Simplified for equal-distance geometry (observer and source equidistant):
 *   θ± = ½(β ± √(β² + 4θ_E²))
 *
 * where θ_E = √(b₀ / D_eff) is the Einstein radius.
 *
 * @param beta      True angular source position [rad]
 * @param b0        Throat radius [m]
 * @param distance  Observer–wormhole distance [m]
 */
export function lensingImagePositions(
  beta: number,
  b0: number,
  distance: number
): { thetaPlus: number; thetaMinus: number; einsteinRadius: number } {
  const thetaE = Math.sqrt(b0 / distance)
  const discriminant = Math.sqrt(beta * beta + 4 * thetaE * thetaE)

  return {
    thetaPlus: 0.5 * (beta + discriminant),
    thetaMinus: 0.5 * (beta - discriminant),
    einsteinRadius: thetaE,
  }
}

/**
 * Point-source magnification for each image.
 *
 *   μ± = (u² + 2) / (2u √(u² + 4)) ± 1/2
 *
 * where u = β / θ_E (normalised source position).
 */
export function lensingMagnification(
  beta: number,
  thetaE: number
): { muPlus: number; muMinus: number; totalMu: number } {
  const u = Math.abs(beta) / thetaE
  const sq = Math.sqrt(u * u + 4)
  const muPlus = (u * u + 2) / (2 * u * sq) + 0.5
  const muMinus = Math.abs((u * u + 2) / (2 * u * sq) - 0.5)
  return { muPlus, muMinus, totalMu: muPlus + muMinus }
}

// ─── Exotic Matter ────────────────────────────────────────────────────────────

/**
 * Exotic matter energy density required to sustain the wormhole throat.
 *
 * From the Einstein field equations:
 *   ρ(r) = −(c²/8πG) · b'(r)/r²
 *
 * For Ellis wormhole b'(r) = 0: the energy density is zero everywhere
 * except at the throat itself (a delta-function singularity in energy density).
 *
 * For the power-law shape b(r) = b₀²/r:
 *   ρ(r) = +(c²/8πG) · b₀²/r⁴  > 0  outside throat
 *   p_r(r) = −(c²/8πG) · b₀²/r⁴  (radial pressure, strongly negative)
 *
 * The violation of the Null Energy Condition (NEC):
 *   ρ + p_r = −(c²/4πG) · b₀²/r⁴ < 0
 *
 * @param r   Radial coordinate [m]
 * @param b0  Throat radius [m]
 */
export function exoticMatterDensity(r: number, b0: number): number {
  const { c, G } = CONSTANTS
  // Using power-law b(r) = b₀²/r for a physically richer model
  const bPrime = -(b0 * b0) / (r * r)
  return -(c * c / (8 * Math.PI * G)) * (bPrime / (r * r))
}

/**
 * Total exotic matter energy integrated over the wormhole.
 *
 * Order-of-magnitude estimate (Visser 1995):
 *   M_exotic ~ −c²b₀/(4G)
 *
 * For b₀ = 1 km: M_exotic ~ −3.4 × 10²³ kg ~ −0.17 Earth masses
 * For b₀ = 1 AU: M_exotic ~ −5 × 10³⁴ kg ~ 25 solar masses
 */
export function totalExoticMatterMass(b0: number): number {
  const { c, G } = CONSTANTS
  return -(c * c * b0) / (4 * G)
}

// ─── Tidal Forces ─────────────────────────────────────────────────────────────

/**
 * Tidal acceleration experienced by a radially-falling observer.
 *
 * For the zero-tidal-force wormhole (Φ = 0):
 *   a_tidal = 0  (by construction — Morris & Thorne designed this)
 *
 * For a general shape function:
 *   a_tidal ≈ c² |Φ'(l)| · L_body
 *
 * where L_body is the body length. We return 0 for the Ellis wormhole.
 */
export function tidalAcceleration(_l: number, _b0: number): number {
  return 0 // Zero tidal force for Φ = 0 wormhole
}

// ─── Traversal ────────────────────────────────────────────────────────────────

/**
 * Proper time for a traveler to traverse the wormhole at velocity v.
 *
 *   τ_traveler = (1/v) ∫ dl = throat_length / v
 *
 * With relativistic time dilation:
 *   τ = throat_length / (γ · v)  (proper time on the ship)
 *
 * @param throatLength  Length of wormhole [m]
 * @param velocityFracC Traveler velocity as fraction of c (0 < v < 1)
 */
export function traversalProperTime(
  throatLength: number,
  velocityFracC: number
): number {
  const v = velocityFracC * CONSTANTS.c
  const gamma = 1 / Math.sqrt(1 - velocityFracC * velocityFracC)
  return throatLength / (v * gamma)
}

/**
 * Coordinate time for an external observer watching the traversal.
 *   t_coord = throat_length / v  (same formula but no gamma — external time)
 */
export function traversalCoordinateTime(
  throatLength: number,
  velocityFracC: number
): number {
  const v = velocityFracC * CONSTANTS.c
  return throatLength / v
}

// ─── Master Physics Computation ───────────────────────────────────────────────

/**
 * Compute all physical metrics for a wormhole configuration.
 *
 * @param params  Wormhole parameter object
 * @returns       Comprehensive metrics object
 */
export function computePhysicsMetrics(params: WormholeParameters): PhysicsMetrics {
  const { throatRadius: b0, throatLength } = params

  const nearB = b0 * 1.1 // 10% above critical

  return {
    throatRadius: b0,
    criticalImpactParameter: criticalImpactParameter(b0),
    photonOrbitRadius: b0,
    tidalForce: tidalAcceleration(0, b0),
    traversalTime: traversalProperTime(throatLength, 0.1),
    exoticMatterDensity: exoticMatterDensity(b0, b0),
    totalExoticMatter: totalExoticMatterMass(b0),
    nearCriticalDeflection: deflectionAngle(nearB, b0),
    flaresOut: shapeFunctionDerivative(b0, b0) < 1,
  }
}

/**
 * Compute the full wormhole geometry.
 */
export function computeWormholeGeometry(params: WormholeParameters): WormholeGeometry {
  const { throatRadius: b0 } = params

  const embeddingPoints: EmbeddingPoint[] = []
  const N = 120
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const r = b0 + (6 * b0 - b0) * t * t // quadratic spacing, throat → 6b₀
    const z = embeddingZ(r, b0)
    // phi=0 cross-section for the 2D profile curve
    embeddingPoints.push({ r, z, phi: 0, x: r, y: 0, zCoord: z })
  }

  return {
    throatRadius: b0,
    photonSphereRadius: b0,
    criticalImpactParameter: criticalImpactParameter(b0),
    minimumRadius: b0,
    embeddingPoints,
    flaringOutCondition: true,  // b'(r₀) = 0 < 1
    zeroTidalForce: params.redshiftFunction === 0,
  }
}

// ─── Coordinate Conversion ────────────────────────────────────────────────────

/**
 * Convert equatorial (RA, Dec) sky position to 3D Cartesian coordinates
 * at a given distance.
 *
 * Conventions: x-axis → (RA=0°, Dec=0°), z-axis → Dec=90° (north pole)
 */
export function equatorialToCartesian(
  ra: number,  // degrees
  dec: number, // degrees
  distancePc: number
): { x: number; y: number; z: number } {
  const raRad = (ra * Math.PI) / 180
  const decRad = (dec * Math.PI) / 180
  return {
    x: distancePc * Math.cos(decRad) * Math.cos(raRad),
    y: distancePc * Math.cos(decRad) * Math.sin(raRad),
    z: distancePc * Math.sin(decRad),
  }
}

/**
 * Convert temperature in Kelvin to an approximate RGB hex color.
 * Useful for color-coding stars by spectral class.
 */
export function temperatureToHexColor(temperatureK: number): string {
  // Approximate blackbody color mapping
  let r: number, g: number, b: number

  if (temperatureK < 1000) { r = 255; g = 51; b = 0 }
  else if (temperatureK < 3500) {
    const t = (temperatureK - 1000) / 2500
    r = 255; g = Math.round(51 + t * 100); b = 0
  } else if (temperatureK < 5000) {
    const t = (temperatureK - 3500) / 1500
    r = 255; g = Math.round(151 + t * 80); b = Math.round(t * 50)
  } else if (temperatureK < 6500) {
    const t = (temperatureK - 5000) / 1500
    r = 255; g = Math.round(231 + t * 24); b = Math.round(50 + t * 150)
  } else if (temperatureK < 10000) {
    const t = (temperatureK - 6500) / 3500
    r = Math.round(255 - t * 55); g = 255; b = 255
  } else {
    const t = Math.min((temperatureK - 10000) / 20000, 1)
    r = Math.round(200 - t * 50); g = Math.round(255 - t * 55); b = 255
  }

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

/**
 * Map Harvard spectral class to approximate effective temperature [K].
 */
export function spectralClassToTemperature(spectralClass: string): number {
  const cls = spectralClass.charAt(0).toUpperCase()
  const map: Record<string, number> = {
    O: 40000, B: 20000, A: 9000, F: 7000, G: 5500, K: 4000, M: 3000,
  }
  return map[cls] ?? 5500
}
