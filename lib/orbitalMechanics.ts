/**
 * @fileoverview Orbital Mechanics Engine — Near Black Hole Particle Dynamics
 *
 * Implements numerical integration of test-particle trajectories in the
 * Schwarzschild spacetime. Uses the effective potential approach.
 *
 * The radial equation of motion (effective potential):
 *   (dr/dτ)² = E² - V_eff(r)
 *
 * where:
 *   V_eff(r) = (1 - Rs/r)(1 + L²/r²)   [massive particles, c=G=1 units]
 *   V_eff(r) = (1 - Rs/r)(L²/r²)        [photons]
 *
 * E = specific energy (conserved), L = specific angular momentum (conserved)
 *
 * @module orbitalMechanics
 */

import type { SimulationParticle, ParticleType, BlackHoleInput } from "@/types/blackHole"
import { SPEED_OF_LIGHT, GRAVITATIONAL_CONSTANT } from "./blackHolePhysics"
import { timeDilationFactor } from "./blackHolePhysics"

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Orbital speed color: maps v/c to a visible color.
 * - Near c (> 0.9): hot white-blue
 * - 0.5 - 0.9: blue
 * - 0.1 - 0.5: cyan-green
 * - < 0.1: yellow-orange (slower)
 */
function velocityToColor(velocityOverC: number): string {
  if (velocityOverC > 0.9) return "#ffffff"
  if (velocityOverC > 0.7) return "#88ccff"
  if (velocityOverC > 0.5) return "#00aaff"
  if (velocityOverC > 0.3) return "#00ffcc"
  if (velocityOverC > 0.1) return "#aaff44"
  return "#ffcc00"
}

/**
 * Creates a test particle in a circular orbit at the given radius.
 *
 * Circular orbit conditions in Schwarzschild metric:
 *   v_circ = sqrt(GM / (r - Rs)) [coordinate velocity tangent]
 *   Only possible for r > 3Rs/2 (photon sphere) for massive particles
 *
 * @param radiusInRs Orbital radius in units of Schwarzschild radii
 * @param phase Initial orbital phase [radians]
 * @param rsM Schwarzschild radius [m]
 * @param massKg Black hole mass [kg]
 * @param type Particle type
 * @returns New simulation particle
 */
export function createCircularOrbitParticle(
  radiusInRs: number,
  phase: number,
  rsM: number,
  massKg: number,
  type: ParticleType = "massive"
): SimulationParticle {
  const gm = GRAVITATIONAL_CONSTANT * massKg
  const radiusM = radiusInRs * rsM

  // Circular orbit angular velocity in Schwarzschild coords: Ω = sqrt(GM/r³)
  const angularVelocity = Math.sqrt(gm / Math.pow(radiusM, 3))

  // Orbital velocity
  const circV = Math.sqrt(gm / radiusM)
  const velocityOverC = Math.min(circV / SPEED_OF_LIGHT, 0.9999)

  const x = radiusInRs * Math.cos(phase)
  const y = 0
  const z = radiusInRs * Math.sin(phase)

  const dilation = timeDilationFactor(radiusM, rsM)

  return {
    id: generateParticleId(),
    type,
    position: [x, y, z],
    velocity: [
      -Math.sin(phase) * velocityOverC,
      0,
      Math.cos(phase) * velocityOverC,
    ],
    radius: radiusInRs,
    phase,
    angularVelocity,
    properTime: 0,
    coordinateTime: 0,
    timeDilationFactor: dilation,
    isCaptured: false,
    trail: [],
    color: velocityToColor(velocityOverC),
    opacity: 1,
  }
}

/**
 * Spawns an initial set of particles distributed around the accretion disk.
 *
 * @param input Simulation parameters
 * @param rsM Schwarzschild radius [m]
 * @param iscoRadiusM ISCO radius [m]
 * @param massKg Black hole mass [kg]
 * @returns Array of initialized particles
 */
export function spawnAccretionParticles(
  input: BlackHoleInput,
  rsM: number,
  iscoRadiusM: number,
  massKg: number
): SimulationParticle[] {
  const particles: SimulationParticle[] = []
  const iscoInRs = iscoRadiusM / rsM  // = 3

  for (let i = 0; i < input.particleCount; i++) {
    // Distribute from ISCO out to ~20 Rs, with more near the inner edge
    const t = Math.pow(Math.random(), 1.5)  // Bias toward inner disk
    const radiusInRs = iscoInRs + t * (20 - iscoInRs)

    // Random initial phase
    const phase = (i / input.particleCount) * 2 * Math.PI + Math.random() * 0.3

    // Small disk tilt for 3D appearance
    particles.push(createCircularOrbitParticle(radiusInRs, phase, rsM, massKg))
  }

  return particles
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE STEPPING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Advances a single particle by one time step.
 *
 * Uses simplified circular orbit dynamics in scaled coordinates.
 * In simulation units: 1 unit = Rs, time scaled so orbits are visible.
 *
 * For a circular orbit at radius r (in Rs):
 *   dφ/dt_sim = ω_sim × speed_multiplier
 *   ω_sim = sqrt(1 / r³) (Keplerian, Rs=1 units)
 *
 * Particles inside ISCO gradually spiral inward (plunging orbit).
 *
 * @param particle Current particle state
 * @param deltaT Simulation time step
 * @param rsM Schwarzschild radius [m]
 * @param speedMultiplier Simulation speed factor
 * @param maxTrailLength Maximum trail point count
 * @returns Updated particle state (immutable — returns new object)
 */
export function stepParticle(
  particle: SimulationParticle,
  deltaT: number,
  rsM: number,
  speedMultiplier: number,
  maxTrailLength = 60
): SimulationParticle {
  if (particle.isCaptured) return particle

  const r = particle.radius  // in Rs

  // Angular velocity (Keplerian scaling in Rs units)
  const omega = Math.sqrt(1.0 / Math.pow(r, 3)) * speedMultiplier

  // Update phase
  const newPhase = particle.phase + omega * deltaT

  // Inside ISCO: slowly spiral inward
  let newRadius = r
  if (r < 3.0) {
    // Plunging: radial infall increases as r approaches Rs
    const plungeRate = 0.1 * speedMultiplier * (1 - r / 3.0)
    newRadius = r - plungeRate * deltaT
  }

  // Event horizon crossing
  if (newRadius <= 1.0) {
    return {
      ...particle,
      radius: 1.0,
      isCaptured: true,
      opacity: 0,
    }
  }

  // Update position
  const x = newRadius * Math.cos(newPhase)
  const y = particle.position[1]  // Disk plane: y stays near 0
  const z = newRadius * Math.sin(newPhase)

  // Update trail (add current position, trim old)
  const newTrail = [
    particle.position,
    ...particle.trail.slice(0, maxTrailLength - 1),
  ] as Array<[number, number, number]>

  // Opacity fades near event horizon
  const opacity = Math.min(1, Math.max(0, (newRadius - 1.0) / 2.0))

  // Time dilation update
  const radiusM = newRadius * rsM
  const dilation = timeDilationFactor(radiusM, rsM)

  // Proper time advances slower than coordinate time near the horizon
  const dtProper = deltaT * dilation
  const velocityM = Math.sqrt(GRAVITATIONAL_CONSTANT) / Math.sqrt(radiusM)
  const vOverC = Math.min(velocityM / SPEED_OF_LIGHT, 0.9999)

  return {
    ...particle,
    position: [x, y, z],
    radius: newRadius,
    phase: newPhase,
    trail: newTrail,
    opacity,
    timeDilationFactor: dilation,
    properTime: particle.properTime + dtProper,
    coordinateTime: particle.coordinateTime + deltaT,
    color: velocityToColor(vOverC),
  }
}

/**
 * Advances all particles by one time step.
 *
 * @param particles Array of current particle states
 * @param deltaT Simulation time step
 * @param rsM Schwarzschild radius [m]
 * @param speedMultiplier Simulation speed
 * @returns New array of updated particles
 */
export function stepAllParticles(
  particles: SimulationParticle[],
  deltaT: number,
  rsM: number,
  speedMultiplier: number
): SimulationParticle[] {
  return particles.map((p) => stepParticle(p, deltaT, rsM, speedMultiplier))
}

// ─────────────────────────────────────────────────────────────────────────────
// EFFECTIVE POTENTIAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the Schwarzschild effective potential at radius r for a
 * massive particle with specific angular momentum L.
 *
 *   V_eff(r) = -GM/r + L²/(2r²) - GML²/(c²r³)
 *
 * The last term is the GR correction (absent in Newtonian gravity)
 * that causes the ISCO instability.
 *
 * @param radiusInRs Radius in units of Schwarzschild radii
 * @param angularMomentumOverC Specific angular momentum L/c in Rs units
 * @returns Effective potential value (in units of c²)
 */
export function effectivePotential(
  radiusInRs: number,
  angularMomentumOverC: number
): number {
  if (radiusInRs <= 0) return Infinity
  const r = radiusInRs
  const l = angularMomentumOverC

  // In Rs=1, GM/c²=1/2 units
  const newtonian = -1 / (2 * r)
  const centrifugal = l * l / (2 * r * r)
  const grCorrection = -l * l / (2 * r * r * r)  // -GML²/(c²r³) in Rs units

  return newtonian + centrifugal + grCorrection
}

/**
 * Generates effective potential curve data for plotting.
 *
 * @param angularMomentumOverC Specific angular momentum L/c [Rs units]
 * @param minR Minimum radius [Rs]
 * @param maxR Maximum radius [Rs]
 * @param steps Number of data points
 * @returns Array of {r, V} data points
 */
export function buildEffectivePotentialCurve(
  angularMomentumOverC: number,
  minR = 1.1,
  maxR = 20,
  steps = 200
): Array<{ r: number; V: number }> {
  const points: Array<{ r: number; V: number }> = []
  const dr = (maxR - minR) / steps

  for (let i = 0; i <= steps; i++) {
    const r = minR + i * dr
    const V = effectivePotential(r, angularMomentumOverC)
    if (isFinite(V) && V > -2 && V < 2) {
      points.push({ r, V })
    }
  }

  return points
}

// ─────────────────────────────────────────────────────────────────────────────
// UUID FALLBACK (if uuid package unavailable)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple ID generator for particles (fallback if uuid unavailable).
 */
let _particleIdCounter = 0
export function generateParticleId(): string {
  return `particle-${Date.now()}-${++_particleIdCounter}`
}
