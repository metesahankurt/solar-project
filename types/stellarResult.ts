/**
 * @fileoverview Stellar Evolution Simulator — Çıktı Tipleri
 * Simülasyon sonuçlarının tüm veri yapılarını tanımlar.
 */

/** Yıldız evrim fazlarının adları */
export type StellarPhaseName =
  | "Brown Dwarf"
  | "Pre-Main Sequence"
  | "Main Sequence"
  | "Sub-Giant"
  | "Red Giant Branch"
  | "Horizontal Branch"
  | "Asymptotic Giant Branch"
  | "Red Supergiant"
  | "Blue Supergiant"
  | "Luminous Blue Variable"
  | "Wolf-Rayet"
  | "Planetary Nebula"
  | "Core Collapse Supernova"
  | "Pair Instability Supernova"
  | "Hypernova"
  | "White Dwarf Cooling"
  | "Neutron Star Cooling"
  | "Black Hole"
  | "Red Dwarf (Eternal)"

/** Nihai yıldız kalıntısının türü */
export type StellarRemnantType =
  | "Brown Dwarf"
  | "Red Dwarf"
  | "White Dwarf"
  | "Neutron Star"
  | "Stellar Black Hole"
  | "Intermediate Mass Black Hole"

/** Yıldız spektral sınıfı (Harvard sınıflandırması) */
export type SpectralClass = "O" | "B" | "A" | "F" | "G" | "K" | "M" | "L" | "T"

/** Yıldız parlaklık sınıfı (Yerkes sınıflandırması) */
export type LuminosityClass = "Ia" | "Ib" | "II" | "III" | "IV" | "V" | "VI" | "VII"

/**
 * Tek bir evrim fazını tanımlar.
 * Her faz belirli bir süreye, fiziksel özelliklere ve açıklamaya sahiptir.
 */
export interface StellarPhase {
  /** Faz adı */
  name: StellarPhaseName

  /** Faz başlangıcı — milyar yıl (Gyr) cinsinden */
  startGyr: number

  /** Faz süresi — milyar yıl (Gyr) cinsinden */
  durationGyr: number

  /** Faz sonu — milyar yıl (Gyr) cinsinden */
  endGyr: number

  /** Bu faz sırasında yıldızın yaklaşık yüzey sıcaklığı [K] */
  temperatureK: number

  /** Bu faz sırasında yıldızın yaklaşık parlaklığı [L☉] */
  luminositySolar: number

  /** Bu faz sırasında yıldızın yaklaşık yarıçapı [R☉] */
  radiusSolar: number

  /** Faz rengi (hex kodu — görsel temsil için) */
  color: string

  /** Faz hakkında bilimsel açıklama */
  description: string

  /** Bu faz sırasında enerji üretim mekanizması */
  fusionProcess: string
}

/**
 * Yıldızın temel fiziksel özellikleri (ana dizi başlangıcında).
 */
export interface StellarProperties {
  /** Kütle [M☉] */
  massSolar: number

  /** Parlaklık [L☉] */
  luminositySolar: number

  /** Yarıçap [R☉] */
  radiusSolar: number

  /** Yüzey sıcaklığı [K] */
  surfaceTemperatureK: number

  /** Mutlak magnitude (görsel) */
  absoluteMagnitude: number

  /** Spektral sınıf (örn. "G2") */
  spectralClass: SpectralClass

  /** Parlaklık sınıfı (örn. "V" = ana dizi) */
  luminosityClass: LuminosityClass

  /** Morgan–Keenan tam sınıfı (örn. "G2V") */
  morganKeenanClass: string

  /** Renk indeksi B-V */
  colorIndexBV: number

  /** Güneş ile karşılaştırmalı açıklama (örn. "Güneş'ten 3x daha parlak") */
  comparedToSun: string
}

/**
 * Hertzsprung-Russell diyagramı için bir nokta.
 */
export interface HRDiagramPoint {
  /** Log10(Sıcaklık [K]) — ters eksende gösterilir */
  logTemperature: number

  /** Log10(Parlaklık [L☉]) */
  logLuminosity: number

  /** Faz adı (renk kodlama için) */
  phase: StellarPhaseName

  /** Renk */
  color: string
}

/**
 * Kütle-ömür grafiği için bir veri noktası.
 */
export interface MassLifetimeDataPoint {
  /** Kütle [M☉] */
  massSolar: number

  /** Ana dizi ömrü [Gyr] */
  mainSequenceLifetimeGyr: number

  /** Toplam ömür [Gyr] */
  totalLifetimeGyr: number

  /** Nihai kalıntı türü */
  remnantType: StellarRemnantType

  /** Spektral sınıf */
  spectralClass: SpectralClass
}

/**
 * Tam simülasyon sonucu — API ve UI tarafından kullanılan ana veri yapısı.
 */
export interface StellarEvolutionResult {
  /** Simülasyonda kullanılan giriş kütlesi [M☉] */
  inputMass: number

  /** Simülasyonda kullanılan metaliklik [Fe/H] */
  inputMetallicity: number

  /** Simülasyonda kullanılan dönüş hızı [v/v_crit] */
  inputRotationRate: number

  /** Başlangıç fiziksel özellikleri (ZAMS — Sıfır Yaş Ana Dizisi) */
  zamsProperties: StellarProperties

  /** Ana dizi ömrü [Gyr] */
  mainSequenceLifetimeGyr: number

  /** Toplam yıldız ömrü [Gyr] */
  totalLifetimeGyr: number

  /** Evrim fazlarının kronolojik listesi */
  phases: StellarPhase[]

  /** Nihai yıldız kalıntısı türü */
  finalRemnant: StellarRemnantType

  /** Nihai kalıntı özellikleri */
  finalRemnantDescription: string

  /** Supernova gerçekleşir mi? */
  willExplodeAsSupernovaOrHypernova: boolean

  /** Supernova türü (geçerliyse) */
  supernovaType?: "Type Ib/c" | "Type II" | "Pair Instability" | "Hypernova"

  /** Metaliklik düzeltme faktörü (1.0 = düzeltme yok) */
  metallicityCorrection: number

  /** Dönüş düzeltme faktörü (1.0 = düzeltme yok) */
  rotationCorrection: number

  /** HR diyagramı için evrim yolu noktaları */
  hrDiagramTrack: HRDiagramPoint[]

  /** Hesaplama zaman damgası */
  calculatedAt: string

  /** Model sürümü */
  modelVersion: string
}

/** Kütle-ömür grafiği için referans veri noktası listesi */
export type MassLifetimeCurve = MassLifetimeDataPoint[]
