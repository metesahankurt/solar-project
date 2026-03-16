/**
 * @fileoverview Time Dilation & Relativistic Effects in Schwarzschild Spacetime
 *
 * Provides functions for computing and displaying relativistic time effects
 * near a black hole, including:
 * - Gravitational time dilation
 * - Gravitational redshift
 * - Doppler shift (transverse)
 * - Combined relativistic effects on clocks
 *
 * The Schwarzschild metric element:
 *   dτ² = (1 - Rs/r) dt² - (c²)⁻¹ [(1-Rs/r)⁻¹ dr² + r² dΩ²]
 *
 * For a stationary observer at r:
 *   dτ/dt = sqrt(1 - Rs/r)
 *
 * @module timeDilation
 */

// ─────────────────────────────────────────────────────────────────────────────
// CORE TIME DILATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clock rate ratio for a stationary observer at radius r compared to
 * a distant observer (r → ∞).
 *
 *   dτ/dt = sqrt(1 - Rs/r)
 *
 * Result interpretation:
 * - = 1.0  → At infinity, no time dilation
 * - = 0.5  → Clock runs at 50% of rate of far-away clock
 * - → 0    → At event horizon, clock freezes relative to distant observer
 *
 * @param radiusInRs Distance from singularity in units of Rs
 * @returns Clock rate ratio [0, 1]
 */
export function clockRateAtR(radiusInRs: number): number {
  if (radiusInRs <= 1.0) return 0  // Inside or at event horizon
  return Math.sqrt(1 - 1 / radiusInRs)
}

/**
 * Time elapsed for a distant observer when a local clock ticks by dtLocal.
 *
 *   dt_distant = dt_local / sqrt(1 - Rs/r)
 *
 * i.e. the distant observer sees fewer ticks per unit of their own time.
 *
 * @param localTimeDelta Time elapsed locally [any unit]
 * @param radiusInRs Observer radius in Rs units
 * @returns Time elapsed for distant observer in same units
 */
export function localToDist(localTimeDelta: number, radiusInRs: number): number {
  const rate = clockRateAtR(radiusInRs)
  if (rate <= 0) return Infinity
  return localTimeDelta / rate
}

/**
 * Relative time dilation between two observers at different radii.
 *
 * How much slower clock at r1 runs compared to clock at r2:
 *   ratio = sqrt(1 - Rs/r1) / sqrt(1 - Rs/r2)
 *
 * @param radius1InRs Radius of first observer [Rs]
 * @param radius2InRs Radius of second observer [Rs]
 * @returns Clock rate ratio (< 1 means r1 clock is slower)
 */
export function relativeClockRate(radius1InRs: number, radius2InRs: number): number {
  const rate1 = clockRateAtR(radius1InRs)
  const rate2 = clockRateAtR(radius2InRs)
  if (rate2 <= 0) return Infinity
  return rate1 / rate2
}

// ─────────────────────────────────────────────────────────────────────────────
// GRAVITATIONAL REDSHIFT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gravitational redshift z for light emitted at r and observed at infinity.
 *
 *   1 + z = 1 / sqrt(1 - Rs/r)
 *   z = 1/sqrt(1 - Rs/r) - 1
 *
 * Examples:
 * - At r = 2Rs: z = sqrt(2) - 1 ≈ 0.414 (41% wavelength increase)
 * - At r = 1.5Rs: z = sqrt(3) - 1 ≈ 0.732
 * - At r → Rs: z → ∞
 *
 * @param radiusInRs Emission radius [Rs]
 * @returns Redshift factor z
 */
export function gravitationalRedshiftZ(radiusInRs: number): number {
  if (radiusInRs <= 1.0) return Infinity
  return 1 / Math.sqrt(1 - 1 / radiusInRs) - 1
}

/**
 * Wavelength of light after gravitational redshift.
 *
 *   λ_obs = λ_emit × (1 + z)
 *
 * @param emittedWavelengthM Emitted wavelength [m]
 * @param emissionRadiusInRs Emission radius [Rs]
 * @returns Observed wavelength [m]
 */
export function redshiftedWavelength(
  emittedWavelengthM: number,
  emissionRadiusInRs: number
): number {
  const z = gravitationalRedshiftZ(emissionRadiusInRs)
  if (!isFinite(z)) return Infinity
  return emittedWavelengthM * (1 + z)
}

/**
 * Maps a wavelength in nm to an approximate visible color hex.
 * Extended to include UV → blue shift and IR → red shift effects.
 *
 * @param wavelengthNm Wavelength in nanometers
 * @returns Hex color string
 */
export function wavelengthToColor(wavelengthNm: number): string {
  if (wavelengthNm < 380) return "#9400D3"    // UV/violet
  if (wavelengthNm < 450) return "#8B00FF"    // Violet
  if (wavelengthNm < 495) return "#0000FF"    // Blue
  if (wavelengthNm < 570) return "#00FF00"    // Green
  if (wavelengthNm < 590) return "#FFFF00"    // Yellow
  if (wavelengthNm < 620) return "#FF7F00"    // Orange
  if (wavelengthNm < 750) return "#FF0000"    // Red
  return "#8B0000"                             // Deep red / IR
}

// ─────────────────────────────────────────────────────────────────────────────
// VELOCITY TIME DILATION (Special Relativistic Component)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Special relativistic time dilation for a moving particle.
 *
 * Lorentz factor: γ = 1/sqrt(1 - v²/c²)
 * Clock rate: dτ/dt = 1/γ = sqrt(1 - v²/c²)
 *
 * @param velocityOverC Particle velocity as fraction of c [0, 1)
 * @returns SR clock rate ratio
 */
export function srClockRate(velocityOverC: number): number {
  const vOverCSq = Math.min(velocityOverC * velocityOverC, 0.9999)
  return Math.sqrt(1 - vOverCSq)
}

/**
 * Combined gravitational + kinematic time dilation for an orbiting particle.
 *
 * For a circular orbit at r in Schwarzschild spacetime, the total proper time
 * dilation is (using full GR expression):
 *
 *   dτ/dt = sqrt(1 - 3Rs/(2r))
 *
 * This combines both gravitational dilation and kinematic (SR) dilation.
 * At r = 3Rs/2 (photon sphere), dτ/dt = 0.
 *
 * @param radiusInRs Circular orbit radius [Rs]
 * @returns Total time dilation factor for circular orbit
 */
export function circularOrbitTimeDilation(radiusInRs: number): number {
  if (radiusInRs <= 1.5) return 0  // At or below photon sphere
  return Math.sqrt(1 - 3 / (2 * radiusInRs))
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME DILATION DATA SERIES (for charts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a data series for plotting time dilation vs radius.
 * Useful for Recharts visualization.
 *
 * @param minRs Minimum radius [Rs] (must be > 1)
 * @param maxRs Maximum radius [Rs]
 * @param steps Number of data points
 * @returns Array of chart-ready data objects
 */
export function buildTimeDilationCurve(
  minRs = 1.05,
  maxRs = 20,
  steps = 100
): Array<{
  radiusInRs: number
  stationaryDilation: number
  orbitalDilation: number
  redshiftZ: number
  clockSlowdownPercent: number
}> {
  const points = []
  const dr = (maxRs - minRs) / steps

  for (let i = 0; i <= steps; i++) {
    const r = minRs + i * dr
    const stationary = clockRateAtR(r)
    const orbital = circularOrbitTimeDilation(r)
    const z = gravitationalRedshiftZ(r)

    points.push({
      radiusInRs: parseFloat(r.toFixed(3)),
      stationaryDilation: parseFloat(stationary.toFixed(4)),
      orbitalDilation: orbital >= 0 ? parseFloat(orbital.toFixed(4)) : 0,
      redshiftZ: isFinite(z) ? parseFloat(Math.min(z, 10).toFixed(3)) : 10,
      clockSlowdownPercent: parseFloat(((1 - stationary) * 100).toFixed(2)),
    })
  }

  return points
}

/**
 * Human-readable description of time dilation at a given radius.
 *
 * @param radiusInRs Radius in Schwarzschild units
 * @returns Descriptive string
 */
export function describeDilation(radiusInRs: number): string {
  if (radiusInRs <= 1.0) {
    return "Inside the event horizon — time is frozen for a distant observer."
  }

  const rate = clockRateAtR(radiusInRs)
  const percent = ((1 - rate) * 100).toFixed(1)
  const z = gravitationalRedshiftZ(radiusInRs)

  if (radiusInRs < 1.5) {
    return `Extreme dilation: local clock runs at ${(rate * 100).toFixed(1)}% of distant rate. ` +
           `Light is redshifted by z = ${z.toFixed(1)}×.`
  }

  if (radiusInRs < 3) {
    return `Strong dilation: clock runs ${percent}% slower than at infinity. ` +
           `Gravitational redshift z = ${z.toFixed(3)}.`
  }

  if (radiusInRs < 10) {
    return `Moderate dilation: clock runs ${percent}% slower than at infinity. ` +
           `Redshift z = ${z.toFixed(4)}.`
  }

  return `Weak-field regime: clock runs ${percent}% slower than at infinity. ` +
         `Redshift z = ${z.toFixed(5)} — approaching flat spacetime.`
}
