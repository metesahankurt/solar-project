/**
 * @fileoverview Wormhole Simulation — TypeScript Type Definitions
 *
 * Type system for the Morris–Thorne traversable wormhole simulation.
 * Covers spacetime geometry, photon trajectories, star/galaxy catalogs,
 * and interactive simulation state.
 *
 * References:
 *  - Morris & Thorne (1988), Am. J. Phys. 56(5), 395–412
 *  - Ellis (1973), J. Math. Phys. 14, 104–118
 *  - Visser (1995), "Lorentzian Wormholes: From Einstein to Hawking"
 */

// ─── Wormhole Model Types ─────────────────────────────────────────────────────

/** Supported wormhole spacetime models */
export type WormholeModel = "morris_thorne" | "ellis" | "thin_shell"

/** Shape function variant used for the throat geometry */
export type ShapeFunctionType = "constant" | "power_law" | "exponential"

// ─── Wormhole Parameters ──────────────────────────────────────────────────────

/** User-configurable parameters defining the wormhole geometry */
export interface WormholeParameters {
  /** Throat radius b₀ [meters] — the minimum radial coordinate */
  throatRadius: number
  /** Redshift function value Φ₀ [dimensionless] — 0 = zero tidal force */
  redshiftFunction: number
  /** Throat length parameter L [meters] (coordinate separation of mouths) */
  throatLength: number
  /** Shape function type for b(r) */
  shapeFunctionType: ShapeFunctionType
  /** Wormhole metric model */
  model: WormholeModel
  /** Optional: mass equivalent for display purposes [solar masses] */
  massEquivalent?: number
}

// ─── Spacetime Geometry ───────────────────────────────────────────────────────

/** Computed wormhole spacetime geometry */
export interface WormholeGeometry {
  /** Throat radius b₀ [m] */
  throatRadius: number
  /** Radial coordinate at photon sphere [m] */
  photonSphereRadius: number
  /** Critical impact parameter for photon capture [m] */
  criticalImpactParameter: number
  /** Minimum radial coordinate at throat [m] */
  minimumRadius: number
  /** Embedding diagram sample points */
  embeddingPoints: EmbeddingPoint[]
  /** Flaring-out condition satisfied? b'(r₀) < 1 */
  flaringOutCondition: boolean
  /** Zero tidal force? Φ(l) = 0 */
  zeroTidalForce: boolean
}

/** A single point on the wormhole embedding surface */
export interface EmbeddingPoint {
  /** Radial coordinate r [m] */
  r: number
  /** Embedding height z [m] */
  z: number
  /** Azimuthal angle φ [rad] */
  phi: number
  /** 3D Cartesian x [m] */
  x: number
  /** 3D Cartesian y [m] */
  y: number
  /** 3D Cartesian z-coordinate = embedding z [m] */
  zCoord: number
}

// ─── Photon / Light Ray Types ─────────────────────────────────────────────────

/** Dynamical state of a photon in proper-distance coordinates */
export interface LightRayState {
  /** Proper radial coordinate l [m], negative = region A, positive = region B */
  l: number
  /** Azimuthal angle φ [rad] */
  phi: number
  /** dl/dφ — radial "velocity" in φ-parametrisation */
  dlDphi: number
  /** Current radial coordinate r = √(b₀² + l²) [m] */
  r: number
  /** Region of spacetime */
  region: "A" | "B"
  /** Number of times the ray has crossed the throat */
  throatCrossings: number
}

/** Classification of a photon trajectory outcome */
export type RayOutcome =
  | "passed_through"   // Crossed wormhole throat and exited other side
  | "orbiting"         // Circling at or near the photon sphere (throat)
  | "deflected"        // Scattered back without crossing throat
  | "escaped"          // Reached numerical boundary undeflected

/** A complete integrated photon trajectory */
export interface LightRayTrajectory {
  /** Impact parameter b [m] — b/b₀ < 1 → passes through */
  impactParameter: number
  /** Normalised impact parameter b/b₀ */
  impactParameterNorm: number
  /** Integrated path points (l, φ) and Cartesian positions */
  points: Array<{
    l: number
    phi: number
    x: number
    y: number
    z: number
  }>
  /** Physical outcome of this ray */
  outcome: RayOutcome
  /** Total deflection angle [rad] */
  deflectionAngle: number
  /** Did the ray cross the wormhole throat? */
  crossedThroat: boolean
  /** Display color (hex) for rendering */
  color: string
  /** Fractional brightness for rendering */
  brightness: number
}

// ─── Astronomical Catalog Types ───────────────────────────────────────────────

/** Spectral class of a star (Harvard classification) */
export type SpectralClass = "O" | "B" | "A" | "F" | "G" | "K" | "M"

/** A single star from the Hipparcos / Yale Bright Star Catalog */
export interface StarData {
  /** Catalog identifier (HIP or HR number) */
  id: string
  /** Common name if available */
  name?: string
  /** Right ascension [degrees] */
  ra: number
  /** Declination [degrees] */
  dec: number
  /** Apparent visual magnitude */
  magnitude: number
  /** Harvard spectral class + luminosity class */
  spectralClass: string
  /** Distance [parsecs] */
  distance: number
  /** Blackbody effective temperature [K] */
  temperature: number
  /** Hex color from spectral class */
  color: string
  /** 3D Cartesian position [pc] */
  x: number
  y: number
  z: number
  /** Absolute visual magnitude */
  absoluteMagnitude?: number
  /** Lensed apparent position (computed at runtime) */
  lensedRA?: number
  lensedDec?: number
  /** Lensing magnification factor */
  magnification?: number
}

/** Hubble / morphological galaxy type */
export type GalaxyType = "E" | "S0" | "Sa" | "Sb" | "Sc" | "Sd" | "SBa" | "SBb" | "SBc" | "Irr"

/** A single galaxy from the Messier / NGC / SDSS catalog */
export interface GalaxyData {
  /** Catalog identifier */
  id: string
  /** Common name */
  name: string
  /** Right ascension [degrees] */
  ra: number
  /** Declination [degrees] */
  dec: number
  /** Cosmological redshift z */
  redshift: number
  /** Hubble type */
  type: GalaxyType
  /** Apparent visual magnitude */
  magnitude: number
  /** Angular diameter [arcmin] */
  angularSize?: number
  /** Luminosity distance [Mpc] */
  distanceMpc: number
  /** 3D position [Mpc] */
  x: number
  y: number
  z: number
  /** Hex color for display */
  color: string
  /** Lensing magnification (computed at runtime) */
  magnification?: number
}

// ─── Physics Metrics ─────────────────────────────────────────────────────────

/** Computed physics metrics for the current wormhole configuration */
export interface PhysicsMetrics {
  /** Throat radius b₀ [m] */
  throatRadius: number
  /** Critical impact parameter b_c = b₀ [m] */
  criticalImpactParameter: number
  /** Photon sphere radius (= throat for Ellis wormhole) [m] */
  photonOrbitRadius: number
  /** Tidal acceleration experienced by traveler [m/s²] */
  tidalForce: number
  /** Proper traversal time at 10% c [s] */
  traversalTime: number
  /** Exotic matter energy density at throat [kg/m³] */
  exoticMatterDensity: number
  /** Total exotic matter required [kg] (order of magnitude) */
  totalExoticMatter: number
  /** Deflection angle for b = 1.1·b₀ [rad] */
  nearCriticalDeflection: number
  /** Does b'(r₀) < 1 (flaring-out condition)? */
  flaresOut: boolean
}

// ─── Lensing Types ────────────────────────────────────────────────────────────

/** Result of computing lensing for a single source position */
export interface LensingResult {
  /** True angular position [rad] */
  trueAngle: number
  /** Primary lensed image position [rad] */
  imagePlus: number
  /** Secondary lensed image position [rad] */
  imageMinus: number
  /** Primary image magnification */
  muPlus: number
  /** Secondary image magnification */
  muMinus: number
  /** Total magnification */
  totalMagnification: number
  /** Einstein radius for this configuration [rad] */
  einsteinRadius: number
}

// ─── Simulation State ─────────────────────────────────────────────────────────

/** Full interactive simulation state */
export interface WormholeSimulationState {
  // Wormhole parameters
  /** Throat radius in solar radii (display units) */
  throatRadiusSolar: number
  /** Mouth separation in AU */
  mouthSeparationAU: number

  // Camera
  cameraDistance: number
  cameraAzimuth: number
  cameraElevation: number

  // Scene toggles
  showEmbeddingDiagram: boolean
  showStarField: boolean
  showLightRays: boolean
  showGalaxies: boolean
  showExoticMatter: boolean
  showLensing: boolean

  // Render parameters
  starDensity: number     // 0–1
  lightRayCount: number   // 4–64
  animationSpeed: number  // 0–2

  // Active region
  activeRegion: "A" | "B" | "both"

  // Computed (runtime)
  geometry?: WormholeGeometry
  metrics?: PhysicsMetrics
  trajectories?: LightRayTrajectory[]
}

// ─── NASA Dataset Response ────────────────────────────────────────────────────

/** Parsed NASA SkyView / Hipparcos catalog response */
export interface NASAStarCatalog {
  source: string
  retrievedAt: string
  count: number
  stars: StarData[]
}

/** Parsed galaxy catalog */
export interface GalaxyCatalog {
  source: string
  count: number
  galaxies: GalaxyData[]
}
