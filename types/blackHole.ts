/**
 * @fileoverview Black Hole Simulator — TypeScript Type Definitions
 *
 * Complete type system for the black hole simulation platform.
 * Covers Schwarzschild metric, accretion physics, orbital mechanics,
 * gravitational lensing, and simulation state.
 *
 * @module types/blackHole
 */

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICAL CONSTANTS TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Black hole classification by mass */
export type BlackHoleClass =
  | "primordial"    // < 0.1 M☉ — hypothetical
  | "stellar"       // 3 – 100 M☉ — stellar collapse remnants
  | "intermediate"  // 100 – 1e5 M☉ — intermediate mass
  | "supermassive"  // > 1e5 M☉ — galactic centers
  | "ultramassive"  // > 1e10 M☉ — rare giants

/** Metric type — affects geodesic structure */
export type MetricType = "schwarzschild" | "kerr"

/** Accretion disk model type */
export type AccretionModel =
  | "none"           // No accretion disk
  | "thin_disk"      // Shakura-Sunyaev thin disk (standard)
  | "thick_disk"     // Advection-dominated accretion flow (ADAF)
  | "magnetically_arrested" // MAD — magnetically arrested disk

/** Particle type in simulation */
export type ParticleType = "massive" | "photon" | "test_mass"

/** Orbital fate of a particle */
export type OrbitalFate =
  | "stable_orbit"    // Particle stays in stable circular orbit
  | "plunging"        // Inside ISCO, falls in
  | "escaping"        // Hyperbolic trajectory, escapes
  | "captured"        // Photon captured by photon sphere
  | "deflected"       // Photon deflected by gravity and escapes

// ─────────────────────────────────────────────────────────────────────────────
// BLACK HOLE PARAMETERS (USER INPUT)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User-configurable black hole parameters.
 * These drive all physics calculations.
 */
export interface BlackHoleInput {
  /** Black hole mass in solar masses (M☉). Range: 1 – 1e10 */
  massInSolarMasses: number

  /**
   * Dimensionless spin parameter a* = Jc/(GM²).
   * Range [0, 1): 0 = Schwarzschild (non-spinning), ~1 = extremal Kerr.
   * For Phase 1 we support Schwarzschild only (a* = 0).
   */
  spinParameter: number

  /** Accretion disk model selection */
  accretionModel: AccretionModel

  /**
   * Accretion rate relative to Eddington rate [0–1].
   * 0 = no accretion, 1 = Eddington limit.
   */
  accretionRate: number

  /** Distance of test particle / observer [in units of Schwarzschild radii] */
  observerDistance: number

  /** Simulation time multiplier (1 = real-time scaled, 10 = 10× faster) */
  simulationSpeed: number

  /** Number of test particles to spawn */
  particleCount: number

  /** Whether to render photon trajectory paths */
  showPhotonPaths: boolean

  /** Whether to show the photon sphere ring */
  showPhotonSphere: boolean

  /** Whether to render lensed background stars */
  showGravitationalLensing: boolean
}

/** Default parameter set for a stellar-mass black hole */
export const DEFAULT_BLACK_HOLE_INPUT: BlackHoleInput = {
  massInSolarMasses: 10,
  spinParameter: 0,
  accretionModel: "thin_disk",
  accretionRate: 0.1,
  observerDistance: 20,
  simulationSpeed: 1,
  particleCount: 30,
  showPhotonPaths: true,
  showPhotonSphere: true,
  showGravitationalLensing: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED PHYSICAL QUANTITIES (COMPUTED OUTPUT)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All Schwarzschild metric radii and derived quantities.
 * All radii in meters unless noted.
 */
export interface SchwarzschildGeometry {
  /** Schwarzschild radius Rs = 2GM/c² [m] */
  schwarzschildRadiusM: number

  /** Schwarzschild radius [km] — human-readable */
  schwarzschildRadiusKm: number

  /**
   * Photon sphere radius r_ph = 1.5 Rs [m].
   * Unstable circular orbit of photons.
   */
  photonSphereRadiusM: number

  /**
   * Innermost Stable Circular Orbit (ISCO) radius.
   * For Schwarzschild: r_ISCO = 3 Rs = 6GM/c² [m].
   * Inside this, all orbits plunge into the singularity.
   */
  iscoRadiusM: number

  /**
   * Marginally bound orbit r_mb = 2 Rs [m].
   * Lowest energy unbound orbit.
   */
  marginallyBoundRadiusM: number

  /** Event horizon radius (= Rs for Schwarzschild) [m] */
  eventHorizonRadiusM: number

  /** Mass in kg */
  massKg: number

  /** Mass in solar masses */
  massSolar: number

  /** Black hole classification by mass */
  classification: BlackHoleClass
}

/**
 * Relativistic orbital mechanics at a given radius.
 */
export interface OrbitalProperties {
  /** Distance from singularity [m] */
  radiusM: number

  /** Radial distance in Schwarzschild radii (r / Rs) */
  radiusInRs: number

  /** Circular orbital velocity [m/s] */
  circularOrbitVelocity: number

  /** Circular orbital velocity as fraction of c */
  circularOrbitVelocityOverC: number

  /** Escape velocity from this radius [m/s] */
  escapeVelocity: number

  /** Escape velocity as fraction of c */
  escapeVelocityOverC: number

  /** Orbital period [seconds] */
  orbitalPeriodSeconds: number

  /** Orbital period [hours] */
  orbitalPeriodHours: number

  /** Gravitational time dilation factor at this radius */
  timeDilationFactor: number

  /** Gravitational redshift z at this radius */
  gravitationalRedshift: number

  /** Whether this orbit is stable (r >= r_ISCO) */
  isStable: boolean

  /** Orbital fate classification */
  fate: OrbitalFate
}

/**
 * Accretion disk physical properties.
 */
export interface AccretionDiskProperties {
  /** Inner edge radius of disk [m] — equals ISCO for thin disk */
  innerEdgeRadiusM: number

  /** Outer edge radius of disk [m] */
  outerEdgeRadiusM: number

  /** Peak temperature of the disk [K] — at inner edge */
  peakTemperatureK: number

  /** Eddington luminosity [W] */
  eddingtonLuminosityW: number

  /** Actual luminosity [W] */
  actualLuminosityW: number

  /** Dominant emission spectrum peak wavelength [m] — Wien's law */
  peakWavelengthM: number

  /** Color of peak emission (hex) */
  peakEmissionColor: string

  /** Radiative efficiency (fraction of rest mass energy radiated) */
  radiativeEfficiency: number
}

/**
 * Gravitational lensing properties for light rays.
 */
export interface LensingProperties {
  /** Impact parameter b at which light is captured [m] */
  criticalImpactParameterM: number

  /** Einstein radius for a background source at infinity [rad] */
  einsteinRadiusRad: number

  /** Maximum bending angle [radians] for light grazing event horizon */
  maxBendingAngleRad: number

  /**
   * Bending angle for a ray at impact parameter b.
   * @param impactParameterM Impact parameter [m]
   * @returns Bending angle in radians
   */
  bendingAngleAtB: (impactParameterM: number) => number
}

/**
 * Complete output of the black hole physics engine.
 */
export interface BlackHoleSimulationResult {
  /** Input parameters used */
  input: BlackHoleInput

  /** Spacetime geometry */
  geometry: SchwarzschildGeometry

  /** Orbital properties at observer distance */
  observerOrbit: OrbitalProperties

  /** Accretion disk properties (null if no disk) */
  accretionDisk: AccretionDiskProperties | null

  /** Gravitational lensing properties */
  lensing: LensingProperties

  /** Time dilation factor for an observer at infinity vs. at observer distance */
  observerTimeDilationFactor: number

  /** Human-readable summary description */
  summary: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION PARTICLE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * State of a single test particle at a moment in time.
 */
export interface SimulationParticle {
  id: string

  /** Type of particle */
  type: ParticleType

  /** 3D position [x, y, z] in simulation units (1 unit = Rs) */
  position: [number, number, number]

  /** 3D velocity [vx, vy, vz] in simulation units per timestep */
  velocity: [number, number, number]

  /** Current radius from singularity [in Rs] */
  radius: number

  /** Current orbital phase angle [radians] */
  phase: number

  /** Angular velocity [rad/s in scaled units] */
  angularVelocity: number

  /** Proper time elapsed for this particle */
  properTime: number

  /** Coordinate time elapsed */
  coordinateTime: number

  /** Time dilation factor at current position */
  timeDilationFactor: number

  /** Whether particle has crossed event horizon */
  isCaptured: boolean

  /** Trail of past positions for visualization */
  trail: Array<[number, number, number]>

  /** Visual color (based on velocity / temperature) */
  color: string

  /** Opacity (fades as particle approaches event horizon) */
  opacity: number
}

/**
 * State of a photon trajectory (null geodesic).
 */
export interface PhotonTrajectory {
  id: string

  /** Initial launch angle [radians from radial direction] */
  launchAngle: number

  /** Impact parameter b = L/E [in Rs] */
  impactParameter: number

  /** Array of [r, phi] points along the trajectory [in Rs and radians] */
  path: Array<[number, number]>

  /** Whether this photon was captured */
  isCaptured: boolean

  /** Whether this photon escaped */
  isEscaping: boolean

  /** Total bending angle accumulated [radians] */
  totalBendingAngle: number

  /** Color of the photon ray */
  color: string
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION STATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Global simulation runtime state.
 * Managed by SimulationContext (React Context).
 */
export interface SimulationState {
  /** Is simulation running */
  isRunning: boolean

  /** Simulation time elapsed [scaled seconds] */
  simulationTime: number

  /** Current parameters */
  params: BlackHoleInput

  /** Computed physics result */
  result: BlackHoleSimulationResult | null

  /** Active particles */
  particles: SimulationParticle[]

  /** Active photon trajectories */
  photonPaths: PhotonTrajectory[]

  /** Whether to show event horizon ring */
  showEventHorizon: boolean

  /** Whether to show photon sphere ring */
  showPhotonSphere: boolean

  /** Whether to show ISCO ring */
  showISCO: boolean

  /** Whether to show orbital trails */
  showTrails: boolean

  /** Active visualization layers */
  layers: {
    accretionDisk: boolean
    particles: boolean
    photonPaths: boolean
    lensing: boolean
    labels: boolean
  }

  /** Camera target (which object to focus) */
  cameraTarget: "black_hole" | "particle" | "free"
}

/** Default simulation state */
export const DEFAULT_SIMULATION_STATE: Omit<SimulationState, "result"> = {
  isRunning: true,
  simulationTime: 0,
  params: DEFAULT_BLACK_HOLE_INPUT,
  particles: [],
  photonPaths: [],
  showEventHorizon: true,
  showPhotonSphere: true,
  showISCO: true,
  showTrails: true,
  layers: {
    accretionDisk: true,
    particles: true,
    photonPaths: true,
    lensing: true,
    labels: true,
  },
  cameraTarget: "black_hole",
}
