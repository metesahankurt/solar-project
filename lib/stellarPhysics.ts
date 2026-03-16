/**
 * @fileoverview Stellar Physics Engine — Temel Astrofizik Hesaplamaları
 *
 * Bu modül yıldız evrimi simülatörünün çekirdek fizik motorunu içerir.
 * Tüm denklemler basitleştirilmiş ama bilimsel olarak geçerli astrofiziksel
 * modellerden türetilmiştir.
 *
 * Referanslar:
 * - Prialnik, D. (2000). An Introduction to the Theory of Stellar Structure and Evolution.
 * - Kippenhahn, R. & Weigert, A. (1990). Stellar Structure and Evolution.
 * - Carroll, B. & Ostlie, D. (2017). An Introduction to Modern Astrophysics.
 *
 * @module stellarPhysics
 */

import type { SpectralClass, LuminosityClass, StellarProperties } from "@/types/stellarResult"

// ─────────────────────────────────────────────────────────────────────────────
// FİZİKSEL SABİTLER
// ─────────────────────────────────────────────────────────────────────────────

/** Güneş kütlesi [kg] */
export const SOLAR_MASS_KG = 1.989e30

/** Güneş yarıçapı [m] */
export const SOLAR_RADIUS_M = 6.957e8

/** Güneş parlaklığı [W] */
export const SOLAR_LUMINOSITY_W = 3.828e26

/** Güneş yüzey sıcaklığı [K] */
export const SOLAR_TEMPERATURE_K = 5778

/** Güneş ana dizi ömrü [Gyr] */
export const SOLAR_MS_LIFETIME_GYR = 10.0

/** Stefan-Boltzmann sabiti [W m⁻² K⁻⁴] */
export const STEFAN_BOLTZMANN = 5.6704e-8

/** Evrenin yaşı [Gyr] */
export const UNIVERSE_AGE_GYR = 13.8

/** Minimum hidrojen füzyonu kütlesi [M☉] */
export const MIN_FUSION_MASS = 0.08

/** Chandrasekhar sınırı [M☉] */
export const CHANDRASEKHAR_LIMIT = 1.44

/** Oppenheimer-Volkoff sınırı [M☉] — nötron yıldızı için üst sınır */
export const OPPENHEIMER_VOLKOFF_LIMIT = 3.0

// ─────────────────────────────────────────────────────────────────────────────
// PARLAKLIK HESAPLAMALARı
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kütle-parlaklık ilişkisinden ZAMS parlaklığını hesaplar.
 *
 * Farklı kütle aralıkları için farklı üsler kullanılır:
 * - M < 0.43 M☉:  L ∝ M^2.3  (Hansen & Kawaler ampirik)
 * - 0.43–2 M☉:   L ∝ M^4.0  (ana dizi fiti)
 * - 2–55 M☉:     L ∝ M^3.5  (Eddington yaklaşımı)
 * - M > 55 M☉:   L ∝ M^1.0  (Eddington parlaklık sınırına yakın)
 *
 * @param massSolar - Yıldız kütlesi [M☉]
 * @returns Parlaklık [L☉]
 */
export function calcLuminosity(massSolar: number): number {
  if (massSolar < 0.43) {
    return 0.23 * Math.pow(massSolar, 2.3)
  } else if (massSolar < 2.0) {
    return Math.pow(massSolar, 4.0)
  } else if (massSolar < 55.0) {
    return 1.4 * Math.pow(massSolar, 3.5)
  } else {
    // Eddington sınırına yakın lineer ilişki
    return 32000 * massSolar
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// YARICAP HESAPLAMALARI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ana dizi yıldızının yarıçapını kütle-yarıçap ilişkisinden hesaplar.
 *
 * - M < 1 M☉:  R ∝ M^0.8
 * - M ≥ 1 M☉:  R ∝ M^0.57  (daha sıkışık yapı)
 *
 * @param massSolar - Yıldız kütlesi [M☉]
 * @returns Yarıçap [R☉]
 */
export function calcRadius(massSolar: number): number {
  if (massSolar < 1.0) {
    return Math.pow(massSolar, 0.8)
  } else {
    return Math.pow(massSolar, 0.57)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SICAKLIK HESAPLAMALARI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stefan-Boltzmann yasasından yüzey sıcaklığını hesaplar.
 *
 * L = 4π R² σ T⁴  →  T = (L / (4π R² σ))^0.25
 *
 * @param luminositySolar - Parlaklık [L☉]
 * @param radiusSolar - Yarıçap [R☉]
 * @returns Yüzey sıcaklığı [K]
 */
export function calcTemperature(luminositySolar: number, radiusSolar: number): number {
  const L = luminositySolar * SOLAR_LUMINOSITY_W
  const R = radiusSolar * SOLAR_RADIUS_M
  return Math.pow(L / (4 * Math.PI * R * R * STEFAN_BOLTZMANN), 0.25)
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA DİZİ ÖMÜR HESAPLAMASI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yıldızın Ana Dizi (Main Sequence) ömrünü hesaplar.
 *
 * Standart astrofizik yaklaşımı:
 *   t_MS = t_☉ × (M/M☉) / (L/L☉)
 *
 * Parlaklık-kütle ilişkisi kullanılarak:
 *   t_MS ≈ t_☉ × (M/M☉)^(-2.5)  [basitleştirilmiş form]
 *
 * Metaliklik ve dönüş düzeltmeleri uygulanabilir.
 *
 * @param massSolar - Yıldız kütlesi [M☉]
 * @param metallicityCorrection - Metaliklik düzeltme çarpanı (varsayılan: 1.0)
 * @param rotationCorrection - Dönüş düzeltme çarpanı (varsayılan: 1.0)
 * @returns Ana Dizi ömrü [Gyr]
 */
export function calcMainSequenceLifetime(
  massSolar: number,
  metallicityCorrection: number = 1.0,
  rotationCorrection: number = 1.0
): number {
  if (massSolar < MIN_FUSION_MASS) {
    // Kahverengi cüce — füzyon yok, efektif "ömür" yok
    return Infinity
  }

  const luminosity = calcLuminosity(massSolar)
  // t = M / L × t_☉  (enerji bütçesi argümanı)
  const baseLifetime = SOLAR_MS_LIFETIME_GYR * (massSolar / luminosity)

  return baseLifetime * metallicityCorrection * rotationCorrection
}

// ─────────────────────────────────────────────────────────────────────────────
// METALİKLİK DÜZELTMESİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Metaliklikten ana dizi ömrü düzeltme çarpanını hesaplar.
 *
 * Düşük metaliklik → daha düşük opasite → daha yüksek enerji taşınımı
 * → hafif daha uzun ömür (yaklaşık ~%15'e kadar etki).
 *
 * Basitleştirilmiş lineer model:
 *   correction ≈ 1 + 0.15 × (-[Fe/H] / 2)  for [Fe/H] in [-4, +0.5]
 *
 * @param metallicityFeH - Metaliklik [Fe/H] (log ölçeği)
 * @returns Düzeltme çarpanı (≥ 1.0)
 */
export function calcMetallicityCorrection(metallicityFeH: number): number {
  // [Fe/H] = 0 → Güneş metalikliği → düzeltme = 1.0
  // Daha düşük metaliklik → daha uzun ömür
  const clampedFeH = Math.max(-4.0, Math.min(0.5, metallicityFeH))
  return 1.0 + 0.15 * (-clampedFeH / 2.0)
}

// ─────────────────────────────────────────────────────────────────────────────
// DÖNÜŞ DÜZELTMESİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dönüş hızından ömür düzeltme çarpanını hesaplar.
 *
 * Hızlı dönen yıldızlar daha fazla yakıt karıştırır (rotational mixing)
 * → yakıt deposu daha verimli kullanılır → hafif daha uzun ömür.
 * Ancak kütlle kaybı da artar → zıt etki.
 *
 * Net etki: %10'a kadar ömür uzaması (düşük v/v_crit için)
 *
 * @param rotationFraction - Dönüş hızı [v/v_crit], 0–1 aralığında
 * @returns Düzeltme çarpanı (0.9–1.1 aralığında)
 */
export function calcRotationCorrection(rotationFraction: number): number {
  const clampedRot = Math.max(0, Math.min(1.0, rotationFraction))
  // Düşük dönüşte hafif artış, yüksek dönüşte kütle kaybı baskın
  if (clampedRot < 0.5) {
    return 1.0 + 0.10 * (clampedRot / 0.5)
  } else {
    return 1.10 - 0.20 * ((clampedRot - 0.5) / 0.5)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTLAK MAGNITUDE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parlaklıktan mutlak görsel magnitude hesaplar.
 *
 * M_V = M_V☉ - 2.5 × log10(L/L☉)
 * Güneş için M_V☉ ≈ 4.83
 *
 * @param luminositySolar - Parlaklık [L☉]
 * @returns Mutlak magnitude
 */
export function calcAbsoluteMagnitude(luminositySolar: number): number {
  const M_SUN = 4.83
  return M_SUN - 2.5 * Math.log10(Math.max(1e-10, luminositySolar))
}

// ─────────────────────────────────────────────────────────────────────────────
// RENK İNDEKSİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sıcaklıktan yaklaşık B-V renk indeksini hesaplar.
 *
 * Empirik Ballesteros formülü (2012):
 *   T ≈ 4600 × (1/(0.92(B-V) + 1.7) + 1/(0.92(B-V) + 0.62))
 * Tersine çözüm yaklaşımı kullanılır.
 *
 * @param temperatureK - Yüzey sıcaklığı [K]
 * @returns B-V renk indeksi
 */
export function calcColorIndex(temperatureK: number): number {
  // Basitleştirilmiş polinom uyumu (geniş aralık için)
  const t = temperatureK
  if (t >= 30000) return -0.33
  if (t >= 10000) return -0.33 + 0.33 * ((30000 - t) / 20000)
  if (t >= 7500)  return 0.0  + 0.15 * ((10000 - t) / 2500)
  if (t >= 6000)  return 0.15 + 0.29 * ((7500  - t) / 1500)
  if (t >= 5200)  return 0.44 + 0.37 * ((6000  - t) / 800)
  if (t >= 3700)  return 0.81 + 0.54 * ((5200  - t) / 1500)
  return 1.35 + 0.30 * ((3700 - t) / 1300)
}

// ─────────────────────────────────────────────────────────────────────────────
// SPEKTRAL SINIF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yüzey sıcaklığından spektral sınıfı belirler (Harvard sınıflandırması).
 *
 * @param temperatureK - Yüzey sıcaklığı [K]
 * @returns Spektral sınıf (O, B, A, F, G, K, M, L, T)
 */
export function calcSpectralClass(temperatureK: number): SpectralClass {
  if (temperatureK >= 30000) return "O"
  if (temperatureK >= 10000) return "B"
  if (temperatureK >= 7500)  return "A"
  if (temperatureK >= 6000)  return "F"
  if (temperatureK >= 5200)  return "G"
  if (temperatureK >= 3700)  return "K"
  if (temperatureK >= 2400)  return "M"
  if (temperatureK >= 1400)  return "L"
  return "T"
}

/**
 * Kütle ve parlaklıktan MK spektral alt sınıfını hesaplar.
 * Örnek: "G2", "B3", vb.
 *
 * @param spectralClass - Ana spektral sınıf
 * @param temperatureK - Yüzey sıcaklığı [K]
 * @returns Alt sınıf numarası (0–9)
 */
export function calcSpectralSubclass(spectralClass: SpectralClass, temperatureK: number): number {
  const ranges: Record<SpectralClass, [number, number]> = {
    O: [50000, 30000],
    B: [30000, 10000],
    A: [10000, 7500],
    F: [7500, 6000],
    G: [6000, 5200],
    K: [5200, 3700],
    M: [3700, 2400],
    L: [2400, 1400],
    T: [1400, 700],
  }
  const [hot, cool] = ranges[spectralClass]
  const fraction = (hot - temperatureK) / (hot - cool)
  return Math.round(Math.min(9, Math.max(0, fraction * 9)))
}

// ─────────────────────────────────────────────────────────────────────────────
// PARLAKLK SINIFI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kütle ve evrimi fazından parlaklık sınıfını belirler.
 * Ana dizi yıldızları için Yerkes sınıflandırması.
 *
 * @param massSolar - Kütle [M☉]
 * @returns Parlaklık sınıfı (Ia, Ib, II, III, IV, V, VI, VII)
 */
export function calcLuminosityClass(massSolar: number): LuminosityClass {
  if (massSolar > 50)  return "Ia"  // Çok parlak dev
  if (massSolar > 20)  return "Ib"  // Parlak dev
  if (massSolar > 8)   return "II"  // Parlak dev
  if (massSolar > 2)   return "III" // Dev
  if (massSolar > 1.5) return "IV"  // Alt-dev
  if (massSolar < 0.5) return "VI"  // Alt-cüce
  return "V"                        // Ana dizi (cüce)
}

// ─────────────────────────────────────────────────────────────────────────────
// TAM FİZİKSEL ÖZELLİKLER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verilen kütleden tüm temel yıldız özelliklerini hesaplar.
 * ZAMS (Zero Age Main Sequence) koşulları için geçerlidir.
 *
 * @param massSolar - Kütle [M☉]
 * @returns Yıldızın tam fiziksel özellikleri
 */
export function calcStellarProperties(massSolar: number): StellarProperties {
  const luminosity = calcLuminosity(massSolar)
  const radius = calcRadius(massSolar)
  const temperature = calcTemperature(luminosity, radius)
  const magnitude = calcAbsoluteMagnitude(luminosity)
  const colorIndex = calcColorIndex(temperature)
  const spectralClass = calcSpectralClass(temperature)
  const subclass = calcSpectralSubclass(spectralClass, temperature)
  const luminosityClass = calcLuminosityClass(massSolar)
  const mkClass = `${spectralClass}${subclass}${luminosityClass}`

  // Güneş ile karşılaştırma
  const comparedToSun = buildSunComparison(massSolar, luminosity, radius, temperature)

  return {
    massSolar,
    luminositySolar: luminosity,
    radiusSolar: radius,
    surfaceTemperatureK: Math.round(temperature),
    absoluteMagnitude: parseFloat(magnitude.toFixed(2)),
    spectralClass,
    luminosityClass,
    morganKeenanClass: mkClass,
    colorIndexBV: parseFloat(colorIndex.toFixed(2)),
    comparedToSun,
  }
}

/**
 * Güneş ile okunabilir karşılaştırma metni oluşturur.
 */
function buildSunComparison(
  mass: number,
  lum: number,
  rad: number,
  temp: number
): string {
  const parts: string[] = []

  if (Math.abs(mass - 1.0) < 0.05) {
    parts.push("Güneş benzeri kütle")
  } else if (mass > 1) {
    parts.push(`Güneş'ten ${mass.toFixed(1)}× daha kütleli`)
  } else {
    parts.push(`Güneş'in %${(mass * 100).toFixed(0)}'i kadar kütleli`)
  }

  if (lum > 1.1) {
    parts.push(`${lum.toFixed(0)}× daha parlak`)
  } else if (lum < 0.9) {
    parts.push(`Güneş'in %${(lum * 100).toFixed(1)}'i kadar parlak`)
  } else {
    parts.push("Güneş benzeri parlaklık")
  }

  const deltaT = temp - SOLAR_TEMPERATURE_K
  if (deltaT > 200) {
    parts.push(`${deltaT.toFixed(0)} K daha sıcak`)
  } else if (deltaT < -200) {
    parts.push(`${Math.abs(deltaT).toFixed(0)} K daha soğuk`)
  } else {
    parts.push("Güneş benzeri sıcaklık")
  }

  return parts.join(" · ")
}
