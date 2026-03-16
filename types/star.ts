/**
 * @fileoverview Stellar Evolution Simulator — Giriş Tipleri
 * Kullanıcıdan alınan parametreleri ve simülasyon yapılandırmasını tanımlar.
 */

/** Desteklenen metaliklik ön ayarları */
export type MetallicityPreset = "pop_i" | "pop_ii" | "pop_iii" | "custom"

/** Yıldız dönüş hızı sınıflandırması */
export type RotationClass = "slow" | "moderate" | "fast" | "critical"

/**
 * Kullanıcı tarafından girilen yıldız parametreleri.
 * Tüm değerler SI birimleri yerine astrofiziksel birim sistemini kullanır.
 */
export interface StarInput {
  /** Başlangıç kütlesi — Güneş kütlesi cinsinden [M☉]. Aralık: 0.08–150 */
  mass: number

  /**
   * Metaliklik — Güneş metalikliğine göre logaritmik oran [Fe/H].
   * Güneş için 0.0, Popülasyon II için -1.5 tipik değerdir.
   * Varsayılan: 0.0 (Güneş metalikliği)
   */
  metallicity: number

  /**
   * Metaliklik ön ayarı.
   * - pop_i: Genç disk yıldızları (Z ≈ Z☉)
   * - pop_ii: Yaşlı küre küme yıldızları (Z ≈ 0.001)
   * - pop_iii: İlk kuşak yıldızlar (Z ≈ 0)
   * - custom: Kullanıcı tanımlı [Fe/H] değeri
   */
  metallicityPreset: MetallicityPreset

  /**
   * Dönüş hızı — kritik dönüş hızının oranı olarak [v/v_crit].
   * 0 = dönümsüz, 1 = kritik eşikte (ayrışma sınırı)
   * Varsayılan: 0.0
   */
  rotationRate: number

  /** Dönüş hızı sınıflandırması (kullanıcı dostu kategori) */
  rotationClass: RotationClass
}

/**
 * Yıldız simülatörü yapılandırma seçenekleri.
 * Hesaplama hassasiyetini ve çıktı formatını kontrol eder.
 */
export interface SimulatorConfig {
  /** Zaman adımı sayısı (timeline çözünürlüğü). Varsayılan: 1000 */
  timeSteps: number

  /** Metaliklik düzeltmesi uygulansın mı? Varsayılan: true */
  applyMetallicityCorrection: boolean

  /** Dönüm düzeltmesi uygulansın mı? Varsayılan: true */
  applyRotationCorrection: boolean

  /** Logaritmik zaman ölçeği kullanılsın mı? Varsayılan: true */
  logarithmicTimescale: boolean
}

/** Varsayılan simülatör yapılandırması */
export const DEFAULT_SIMULATOR_CONFIG: SimulatorConfig = {
  timeSteps: 1000,
  applyMetallicityCorrection: true,
  applyRotationCorrection: true,
  logarithmicTimescale: true,
}

/** Varsayılan yıldız giriş parametreleri (Güneş benzeri bir yıldız) */
export const DEFAULT_STAR_INPUT: StarInput = {
  mass: 1.0,
  metallicity: 0.0,
  metallicityPreset: "pop_i",
  rotationRate: 0.0,
  rotationClass: "slow",
}

/**
 * Metaliklik ön ayarından [Fe/H] değerini döndürür.
 */
export function metallicityFromPreset(preset: MetallicityPreset): number {
  switch (preset) {
    case "pop_i":   return 0.0
    case "pop_ii":  return -1.5
    case "pop_iii": return -4.0
    case "custom":  return 0.0
  }
}
