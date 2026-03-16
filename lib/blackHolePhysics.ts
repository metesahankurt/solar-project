/**
 * @fileoverview Black Hole Physics Engine — Schwarzschild Metric (NASA/CODATA precision)
 *
 * Implements core general-relativistic calculations for a non-rotating
 * (Schwarzschild) black hole. All equations are derived from the
 * Schwarzschild metric:
 *
 *   ds² = -(1 - Rs/r) c² dt² + (1 - Rs/r)⁻¹ dr² + r² dΩ²
 *
 * where Rs = 2GM/c² is the Schwarzschild radius.
 *
 * Physical constants: CODATA 2018 recommended values (NIST).
 * Astrophysical constants: IAU 2015 nominal solar values.
 *
 * References:
 * - NIST CODATA 2018: https://physics.nist.gov/cuu/Constants/
 * - IAU 2015 Resolution B3: nominal solar constants
 * - Misner, Thorne & Wheeler (1973). Gravitation. W.H. Freeman.
 * - Hartle, J.B. (2003). Gravity. Addison-Wesley.
 * - Shakura & Sunyaev (1973). A&A 24, 337–355. (disk model)
 * - Bekenstein (1973). Phys. Rev. D 7, 2333. (entropy)
 * - Hawking (1975). Commun. Math. Phys. 43, 199–220. (radiation)
 * - Event Horizon Telescope Collab. (2019). ApJL 875, L1. (M87*)
 * - GRAVITY Collab. (2022). A&A 657, L12. (Sgr A* mass)
 *
 * @module blackHolePhysics
 */

import type {
  BlackHoleInput,
  BlackHoleSimulationResult,
  SchwarzschildGeometry,
  OrbitalProperties,
  AccretionDiskProperties,
  LensingProperties,
  BlackHoleClass,
  OrbitalFate,
} from "@/types/blackHole"

// ─────────────────────────────────────────────────────────────────────────────
// FUNDAMENTAL PHYSICAL CONSTANTS — CODATA 2018 / SI 2019
// ─────────────────────────────────────────────────────────────────────────────

/** Speed of light in vacuum [m/s] — exact, defines the metre */
export const SPEED_OF_LIGHT = 2.99792458e8

/** Speed of light squared [m²/s²] */
export const C_SQUARED = SPEED_OF_LIGHT * SPEED_OF_LIGHT

/** Speed of light to the 4th power */
export const C_FOURTH = C_SQUARED * C_SQUARED

/**
 * Newtonian constant of gravitation [m³ kg⁻¹ s⁻²]
 * CODATA 2018: 6.67430 × 10⁻¹¹  (relative uncertainty 2.2 × 10⁻⁵)
 */
export const GRAVITATIONAL_CONSTANT = 6.67430e-11

/**
 * Reduced Planck constant ħ = h/(2π) [J·s]
 * CODATA 2018: 1.054571817 × 10⁻³⁴  (exact, defined)
 */
export const REDUCED_PLANCK = 1.054571817e-34

/**
 * Boltzmann constant k_B [J/K]
 * SI 2019: 1.380649 × 10⁻²³  (exact, defines the kelvin)
 */
export const BOLTZMANN = 1.380649e-23

/**
 * Stefan-Boltzmann constant σ [W m⁻² K⁻⁴]
 * Derived: σ = 2π⁵k_B⁴/(15h³c²) = 5.670374419 × 10⁻⁸
 */
export const STEFAN_BOLTZMANN = 5.670374419e-8

/**
 * Nominal solar mass parameter GM☉ [m³/s²]
 * IAU 2015 Resolution B3: 1.3271244 × 10²⁰ m³/s²
 * More accurate than G × M☉ since GM☉ is measured directly.
 */
export const GM_SUN = 1.3271244e20

/**
 * Solar mass M☉ [kg] — derived from GM☉/G
 * IAU 2015: 1.98892 × 10³⁰ kg
 */
export const SOLAR_MASS_KG = GM_SUN / GRAVITATIONAL_CONSTANT  // ≈ 1.98892e30

/**
 * Wien's displacement constant b [m·K]
 * b = ħc × 2.821439... / k_B = 2.897771955 × 10⁻³
 */
export const WIENS_CONSTANT = 2.897771955e-3

/**
 * Proton mass [kg]
 * CODATA 2018: 1.67262192369 × 10⁻²⁷
 */
export const PROTON_MASS = 1.67262192369e-27

/**
 * Thomson cross-section σ_T [m²]
 * CODATA 2018: 6.6524587158 × 10⁻²⁹
 */
export const THOMSON_CROSS_SECTION = 6.6524587158e-29

/**
 * Planck length l_P = √(Għ/c³) [m]
 * ≈ 1.616255 × 10⁻³⁵
 */
export const PLANCK_LENGTH = Math.sqrt(GRAVITATIONAL_CONSTANT * REDUCED_PLANCK / Math.pow(SPEED_OF_LIGHT, 3))

/**
 * Planck mass m_P = √(ħc/G) [kg]
 * ≈ 2.176434 × 10⁻⁸
 */
export const PLANCK_MASS = Math.sqrt(REDUCED_PLANCK * SPEED_OF_LIGHT / GRAVITATIONAL_CONSTANT)

/**
 * Schwarzschild radiative efficiency for a non-spinning (Schwarzschild) BH.
 * η_Schw = 1 − √(8/9) ≈ 0.05719
 *
 * This is the fraction of rest-mass energy radiated by matter falling
 * from infinity to the ISCO. For maximally-spinning Kerr: η_Kerr ≈ 0.4238.
 *
 * Reference: Bardeen et al. (1972). ApJ 178, 347.
 */
export const SCHWARZSCHILD_RADIATIVE_EFFICIENCY = 1 - Math.sqrt(8 / 9)  // ≈ 0.05719

// ─────────────────────────────────────────────────────────────────────────────
// SCHWARZSCHILD GEOMETRY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes the Schwarzschild radius Rs = 2GM/c².
 *
 * For a 10 M☉ black hole: Rs ≈ 29.5 km
 * For Sgr A* (4.154×10⁶ M☉): Rs ≈ 12.27 million km ≈ 0.082 AU
 * For M87* (6.5×10⁹ M☉): Rs ≈ 19.2 billion km ≈ 128 AU
 *
 * @param massKg Black hole mass [kg]
 * @returns Schwarzschild radius [m]
 */
export function schwarzschildRadius(massKg: number): number {
  return (2 * GRAVITATIONAL_CONSTANT * massKg) / C_SQUARED
}

/**
 * Classifies the black hole by mass category (astrophysical taxonomy).
 *
 * Based on:
 * - Greene et al. (2020). ARA&A 58, 257 — IMBH classification
 * - King (2016). MNRAS 456, L109 — ultramassive BH definition
 */
export function classifyBlackHole(massSolar: number): BlackHoleClass {
  if (massSolar < 0.1) return "primordial"
  if (massSolar < 100) return "stellar"
  if (massSolar < 1e5) return "intermediate"
  if (massSolar < 1e10) return "supermassive"
  return "ultramassive"
}

/**
 * Computes all key radii in the Schwarzschild metric.
 *
 * Key radii in order from singularity:
 *   r = 0         Singularity (curvature diverges)
 *   r = Rs        Event horizon (g_tt = 0, escape velocity = c)
 *   r = 1.5 Rs    Photon sphere (unstable circular photon orbits)
 *   r = 2.0 Rs    Marginally bound orbit (E = mc², parabolic at infinity)
 *   r = 3.0 Rs    ISCO (innermost stable circular orbit for massive particles)
 *
 * Reference: Bardeen, Press & Teukolsky (1972). ApJ 178, 347–369.
 */
export function computeSchwarzschildGeometry(
  input: BlackHoleInput
): SchwarzschildGeometry {
  const massKg = input.massInSolarMasses * SOLAR_MASS_KG
  const Rs = schwarzschildRadius(massKg)

  return {
    schwarzschildRadiusM: Rs,
    schwarzschildRadiusKm: Rs / 1000,
    photonSphereRadiusM: 1.5 * Rs,
    iscoRadiusM: 3.0 * Rs,                  // r_ISCO = 6GM/c² = 3Rs (Schwarzschild)
    marginallyBoundRadiusM: 2.0 * Rs,        // r_mb = 4GM/c² = 2Rs
    eventHorizonRadiusM: Rs,
    massKg,
    massSolar: input.massInSolarMasses,
    classification: classifyBlackHole(input.massInSolarMasses),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME DILATION & GRAVITATIONAL REDSHIFT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schwarzschild gravitational time dilation factor.
 *
 * A stationary clock at coordinate radius r runs slower than a clock
 * at infinity by the factor:
 *
 *   dτ/dt = √(1 − Rs/r)
 *
 * This is the purely gravitational contribution (no kinematic dilation).
 * For a clock in circular orbit at r, the total proper time rate is:
 *   dτ/dt = √(1 − 3Rs/(2r))   [combining gravitational + kinematic SR]
 *
 * Reference: Schwarzschild (1916). Sitzungsberichte Preussische Akademie.
 *
 * @param radiusM Radial distance from singularity [m]
 * @param rsM Schwarzschild radius [m]
 * @returns Proper time rate dτ/dt ∈ [0, 1]
 */
export function timeDilationFactor(radiusM: number, rsM: number): number {
  if (radiusM <= rsM) return 0
  return Math.sqrt(1 - rsM / radiusM)
}

/**
 * Gravitational redshift z for light emitted at r and received at infinity.
 *
 *   z = λ_obs/λ_emit − 1 = 1/√(1 − Rs/r) − 1
 *
 * At r = 2Rs:    z = √2 − 1 ≈ 0.4142  (+41% wavelength increase)
 * At r = 1.5Rs:  z = √3 − 1 ≈ 0.7321
 * At r → Rs:     z → ∞  (infinite redshift surface = event horizon)
 *
 * Reference: Pound & Rebka (1959, 1960). Phys. Rev. Lett. — first measurement.
 */
export function gravitationalRedshift(radiusM: number, rsM: number): number {
  if (radiusM <= rsM) return Infinity
  return 1 / Math.sqrt(1 - rsM / radiusM) - 1
}

// ─────────────────────────────────────────────────────────────────────────────
// HAWKING RADIATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hawking temperature of a Schwarzschild black hole.
 *
 *   T_H = ħc³ / (8π G M k_B)
 *       ≈ 6.169 × 10⁻⁸ × (M☉/M) K
 *
 * For a 10 M☉ stellar BH: T_H ≈ 6.2 × 10⁻⁹ K  (unmeasurable, ~10⁻⁹ K)
 * For a 10⁶ M☉ SMBH: T_H ≈ 6.2 × 10⁻¹⁴ K
 * For a primordial BH of ~10¹² kg: T_H ≈ 10¹² K  (evaporating now)
 *
 * Reference: Hawking (1975). Commun. Math. Phys. 43, 199–220.
 *
 * @param massKg Black hole mass [kg]
 * @returns Hawking temperature [K]
 */
export function hawkingTemperature(massKg: number): number {
  return (REDUCED_PLANCK * Math.pow(SPEED_OF_LIGHT, 3)) /
    (8 * Math.PI * GRAVITATIONAL_CONSTANT * massKg * BOLTZMANN)
}

/**
 * Hawking evaporation timescale.
 *
 *   t_evap = 5120 π G² M³ / (ħ c⁴)
 *
 * For a 10 M☉ BH: t_evap ~ 2 × 10⁷⁴ years (vastly longer than universe age)
 * For a 10¹² kg BH: t_evap ~ 13.8 Gyr (evaporating today)
 *
 * Reference: Page (1976). Phys. Rev. D 13, 198.
 *
 * @param massKg Black hole mass [kg]
 * @returns Evaporation timescale [seconds]
 */
export function hawkingEvaporationTime(massKg: number): number {
  return (5120 * Math.PI * Math.pow(GRAVITATIONAL_CONSTANT, 2) * Math.pow(massKg, 3)) /
    (REDUCED_PLANCK * Math.pow(SPEED_OF_LIGHT, 4))
}

/**
 * Bekenstein-Hawking entropy.
 *
 *   S_BH = k_B × A / (4 l_P²)  =  k_B × 4π (M/m_P)² × (m_P/M)²...
 *        = k_B × 4π Rs² / (4 l_P²)
 *        = k_B π Rs² / l_P²
 *
 * where l_P = √(Għ/c³) is the Planck length.
 *
 * For a 10 M☉ BH: S ≈ 1.2 × 10⁷⁹ k_B
 * This is proportional to horizon AREA, not volume — a key prediction
 * of the holographic principle.
 *
 * Reference: Bekenstein (1973). Phys. Rev. D 7, 2333–2346.
 *
 * @param massKg Black hole mass [kg]
 * @returns Entropy in units of k_B (dimensionless entropy number)
 */
export function bekensteinHawkingEntropy(massKg: number): number {
  const Rs = schwarzschildRadius(massKg)
  // S/k_B = π Rs² / l_P²
  return Math.PI * Rs * Rs / (PLANCK_LENGTH * PLANCK_LENGTH)
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBITAL MECHANICS
// ─────────────────────────────────────────────────────────────────────────────

function determineOrbitalFate(radiusM: number, iscoM: number, rsM: number): OrbitalFate {
  if (radiusM <= rsM) return "plunging"
  if (radiusM < iscoM) return "plunging"
  return "stable_orbit"
}

/**
 * Computes orbital and kinematic properties at a given radius.
 *
 * Circular orbital velocity in Schwarzschild coordinates (coordinate velocity):
 *   v_circ = (GM/r)^(1/2) / (1 − Rs/r)^(1/2)  ... in the PN sense
 *
 * The proper orbital speed measured by a local static observer:
 *   v_local = √(GM/r) / √(r − Rs) × r/c   [approaches c at ISCO]
 *
 * We report the coordinate orbital velocity used in the energy budget.
 * For the display we use the locally-measured fraction of c:
 *   v/c = (Rs / (2r − Rs))^(1/2)   [exact Schwarzschild circular orbit]
 *
 * Reference: MTW eq. 25.20; Bardeen et al. (1972) eq. 2.16.
 *
 * Orbital period (coordinate time):
 *   T = 2π √(r³/GM)   [same as Kepler — a coincidence of Schwarzschild]
 */
export function computeOrbitalProperties(
  radiusM: number,
  geometry: SchwarzschildGeometry
): OrbitalProperties {
  const { massKg, schwarzschildRadiusM: rsM, iscoRadiusM } = geometry
  const gm = GRAVITATIONAL_CONSTANT * massKg  // = GM_SUN * massSolar (more accurate)

  // Exact locally-measured orbital speed:
  //   v_local/c = √(Rs / (2r − Rs))   valid for r > Rs
  const vOverC = radiusM > rsM
    ? Math.min(Math.sqrt(rsM / (2 * radiusM - rsM)), 0.9999)
    : 0.9999

  const circularOrbitVelocity = vOverC * SPEED_OF_LIGHT

  // Escape velocity (exact GR):
  //   v_esc/c = √(Rs/r)  [same as Newtonian, coincidentally]
  const escapeVOverC = Math.min(Math.sqrt(rsM / radiusM), 1.0)
  const escapeVelocity = escapeVOverC * SPEED_OF_LIGHT

  // Orbital period: T = 2π √(r³/GM)
  const orbitalPeriodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(radiusM, 3) / gm)

  const dilationFactor = timeDilationFactor(radiusM, rsM)
  const redshift = gravitationalRedshift(radiusM, rsM)

  return {
    radiusM,
    radiusInRs: radiusM / rsM,
    circularOrbitVelocity,
    circularOrbitVelocityOverC: vOverC,
    escapeVelocity,
    escapeVelocityOverC: escapeVOverC,
    orbitalPeriodSeconds,
    orbitalPeriodHours: orbitalPeriodSeconds / 3600,
    timeDilationFactor: dilationFactor,
    gravitationalRedshift: redshift,
    isStable: radiusM >= iscoRadiusM,
    fate: determineOrbitalFate(radiusM, iscoRadiusM, rsM),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCRETION DISK PHYSICS — Shakura-Sunyaev (1973) with zero-torque BC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Eddington luminosity — maximum luminosity of steady spherical accretion.
 *
 *   L_Edd = 4π G M m_p c / σ_T
 *         ≈ 1.26 × 10³¹ × (M/M☉)  [W]
 *
 * Physical meaning: above L_Edd, radiation pressure exceeds gravity and
 * blows away the infalling gas.
 *
 * Reference: Eddington (1916); modern form in Frank, King & Raine (2002).
 */
export function eddingtonLuminosity(massKg: number): number {
  return (4 * Math.PI * GRAVITATIONAL_CONSTANT * massKg * PROTON_MASS * SPEED_OF_LIGHT)
    / THOMSON_CROSS_SECTION
}

/**
 * Eddington accretion rate Ṁ_Edd [kg/s].
 *
 *   Ṁ_Edd = L_Edd / (η c²)
 *
 * where η is the radiative efficiency (0.0572 for Schwarzschild).
 *
 * @param massKg Black hole mass [kg]
 * @param eta Radiative efficiency (default: Schwarzschild η ≈ 0.0572)
 */
export function eddingtonAccretionRate(
  massKg: number,
  eta = SCHWARZSCHILD_RADIATIVE_EFFICIENCY
): number {
  return eddingtonLuminosity(massKg) / (eta * C_SQUARED)
}

/**
 * Shakura-Sunyaev (1973) disk temperature profile with zero-torque
 * boundary condition at the ISCO.
 *
 * Full formula (Page & Thorne 1974, eq. 15b):
 *
 *   T(r) = T★ × (r/r_in)^(-3/4) × f(r)^(1/4)
 *
 * where:
 *   T★ = [3 G M Ṁ / (8π σ r_in³)]^(1/4)
 *   f(r) = 1 − √(r_in/r)    [zero-torque BC factor — ISCO inner edge]
 *   Ṁ = accretionFraction × Ṁ_Edd
 *
 * The f(r) term is often omitted in simplified models but it correctly
 * forces T → 0 at the inner edge (r = r_in) and shifts T_peak to r ≈ 1.36 r_in.
 *
 * Reference: Shakura & Sunyaev (1973) A&A 24, 337; Page & Thorne (1974) ApJ 191, 499.
 *
 * @param radiusM Evaluation radius [m]
 * @param innerRadiusM Inner disk edge radius (= ISCO) [m]
 * @param massKg Black hole mass [kg]
 * @param mdotFraction Accretion rate / Eddington accretion rate
 * @returns Local disk temperature [K]
 */
export function diskTemperatureAtRadius(
  radiusM: number,
  innerRadiusM: number,
  massKg: number,
  mdotFraction: number
): number {
  if (radiusM < innerRadiusM) return 0
  const gm = GRAVITATIONAL_CONSTANT * massKg
  const mdot = eddingtonAccretionRate(massKg) * mdotFraction

  // T★ = [3GM Ṁ/(8π σ r_in³)]^(1/4)
  const tStar4 = (3 * gm * mdot) / (8 * Math.PI * STEFAN_BOLTZMANN * Math.pow(innerRadiusM, 3))
  const tStar = Math.pow(Math.max(0, tStar4), 0.25)

  // Radial profile with zero-torque BC
  const rRatio = radiusM / innerRadiusM     // r / r_in  (>= 1)
  const f = 1 - Math.sqrt(1 / rRatio)       // f(r) = 1 - √(r_in/r)
  const T = tStar * Math.pow(rRatio, -0.75) * Math.pow(Math.max(0, f), 0.25)

  return T
}

/**
 * Peak disk temperature (at radius ≈ 1.36 r_in for zero-torque BC disk).
 * Numerically found by evaluating at the analytic peak radius.
 */
export function diskPeakTemperature(
  massKg: number,
  accretionRate: number,
  innerRadiusM: number
): number {
  // Peak at r_peak ≈ (49/36) r_in ≈ 1.361 r_in (from d T/d r = 0)
  const rPeak = (49 / 36) * innerRadiusM
  return diskTemperatureAtRadius(rPeak, innerRadiusM, massKg, accretionRate)
}

/**
 * Maps disk temperature to a physically-accurate emission color.
 *
 * Based on Wien's law peak wavelength:
 *   λ_max = b/T   [Wien's displacement law]
 *
 * and standard CIE color matching.
 *
 * T > 10^7 K → Blue-white: soft X-ray dominated (stellar BH binaries)
 * T ~ 10^5–6 K → UV/white: ISCO of supermassive BH (AGN)
 * T ~ 10^4 K → Yellow-orange: outer disk / optical AGN
 */
export function diskTemperatureColor(temperatureK: number): string {
  if (temperatureK > 1e7) return "#b8d4ff"
  if (temperatureK > 5e6) return "#cce0ff"
  if (temperatureK > 1e6) return "#e8f0ff"
  if (temperatureK > 5e5) return "#fff8e8"
  if (temperatureK > 1e5) return "#ffcc60"
  if (temperatureK > 1e4) return "#ff9922"
  if (temperatureK > 1e3) return "#ff5500"
  return "#cc2200"
}

/**
 * Computes full accretion disk properties.
 */
export function computeAccretionDisk(
  input: BlackHoleInput,
  geometry: SchwarzschildGeometry
): AccretionDiskProperties | null {
  if (input.accretionModel === "none" || input.accretionRate <= 0) return null

  const { massKg, iscoRadiusM, schwarzschildRadiusM: rsM } = geometry
  const innerEdge = iscoRadiusM
  const outerEdge = rsM * 100

  const lEdd = eddingtonLuminosity(massKg)
  const radiativeEfficiency = input.accretionModel === "thin_disk"
    ? SCHWARZSCHILD_RADIATIVE_EFFICIENCY   // 0.0572 — physically correct
    : 0.04                                  // ADAF: lower efficiency

  const actualLuminosity = input.accretionRate * lEdd * radiativeEfficiency
  const peakTemp = diskPeakTemperature(massKg, input.accretionRate, innerEdge)
  const peakWavelength = peakTemp > 0 ? WIENS_CONSTANT / peakTemp : Infinity
  const peakColor = diskTemperatureColor(peakTemp)

  return {
    innerEdgeRadiusM: innerEdge,
    outerEdgeRadiusM: outerEdge,
    peakTemperatureK: peakTemp,
    eddingtonLuminosityW: lEdd,
    actualLuminosityW: actualLuminosity,
    peakWavelengthM: peakWavelength,
    peakEmissionColor: peakColor,
    radiativeEfficiency,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GRAVITATIONAL LENSING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deflection angle of a light ray with impact parameter b.
 *
 * Weak-field (b >> Rs):
 *   α = 2Rs/b   [Einstein 1915; first measured by Eddington 1919]
 *
 * Strong-field (b near b_c, Bozza et al. 2001):
 *   α ≈ −a₁ log(b/b_c − 1) + a₂  [logarithmic divergence]
 *
 * Critical impact parameter:
 *   b_c = (3√3/2) Rs ≈ 2.5981 Rs
 *
 * Reference: Bozza et al. (2001). Gen. Rel. Grav. 33, 1535–1548.
 */
export function lightBendingAngle(impactParameterM: number, rsM: number): number {
  const criticalB = (3 * Math.sqrt(3) / 2) * rsM

  if (impactParameterM <= criticalB) return Math.PI * 2

  const weakField = (2 * rsM) / impactParameterM

  const u = impactParameterM / criticalB - 1
  if (u < 0.05) {
    // Bozza strong-field coefficients for Schwarzschild:
    // a₁ = 1.0, a₂ ≈ 0.9496 + log(216(7−4√3))
    const strongField = -1.0 * Math.log(u) + 0.4002
    return Math.max(weakField, strongField)
  }

  return weakField
}

/**
 * Einstein ring radius θ_E.
 *
 * For a point mass lens, background source at infinity:
 *   θ_E = √(4GM D_LS / (c² D_L D_S))  →  √(Rs/D_L) as D_S → ∞
 *
 * Reference: Einstein (1936). Science 84, 506.
 */
export function einsteinRadius(rsM: number, observerDistM: number): number {
  return Math.sqrt(rsM / observerDistM)
}

export function computeLensing(
  geometry: SchwarzschildGeometry,
  observerDistM: number
): LensingProperties {
  const { schwarzschildRadiusM: rsM } = geometry
  const criticalB = (3 * Math.sqrt(3) / 2) * rsM

  return {
    criticalImpactParameterM: criticalB,
    einsteinRadiusRad: einsteinRadius(rsM, observerDistM),
    maxBendingAngleRad: Math.PI * 4,
    bendingAngleAtB: (b: number) => lightBendingAngle(b, rsM),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER PHYSICS ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function buildSummary(
  geometry: SchwarzschildGeometry,
  disk: AccretionDiskProperties | null
): string {
  const { massSolar, schwarzschildRadiusKm, classification, iscoRadiusM } = geometry
  const rsKm = schwarzschildRadiusKm.toFixed(1)
  const iscoKm = (iscoRadiusM / 1000).toFixed(1)

  const classNames: Record<typeof classification, string> = {
    primordial: "primordial", stellar: "stellar-mass",
    intermediate: "intermediate-mass", supermassive: "supermassive", ultramassive: "ultramassive",
  }

  let s = `A ${classNames[classification]} black hole of mass ${massSolar.toExponential(3)} M☉. `
  s += `Schwarzschild radius: ${rsKm} km. `
  s += `ISCO (innermost stable circular orbit): ${iscoKm} km. `
  const tH = hawkingTemperature(geometry.massKg)
  s += `Hawking temperature: ${tH.toExponential(2)} K. `
  if (disk) s += `Accretion disk peak temperature: ${disk.peakTemperatureK.toExponential(2)} K (${disk.peakEmissionColor}).`
  return s
}

/**
 * Main entry point: runs the complete Schwarzschild black hole physics simulation.
 *
 * @param input User-configurable parameters
 * @returns Complete simulation result
 */
export function runBlackHolePhysics(input: BlackHoleInput): BlackHoleSimulationResult {
  const geometry = computeSchwarzschildGeometry(input)
  const { schwarzschildRadiusM: rsM, massKg } = geometry

  const observerRadiusM = input.observerDistance * rsM
  const observerOrbit = computeOrbitalProperties(observerRadiusM, geometry)

  const accretionDisk = computeAccretionDisk(input, geometry)
  const lensing = computeLensing(geometry, observerRadiusM)

  return {
    input,
    geometry,
    observerOrbit,
    accretionDisk,
    lensing,
    observerTimeDilationFactor: observerOrbit.timeDilationFactor,
    summary: buildSummary(geometry, accretionDisk),
  }
}
