/**
 * @fileoverview Stellar Timeline Engine — Evrim Zaman Çizelgesi Motoru
 *
 * Yıldızın her evrim fazının süresini ve fiziksel özelliklerini hesaplar.
 * Ana Dizi ömrü normalize edilerek diğer fazlar oransal olarak ölçeklendirilir.
 *
 * @module stellarTimeline
 */

import type {
  StellarPhase,
  StellarPhaseName,
  HRDiagramPoint,
  MassLifetimeDataPoint,
  StellarRemnantType,
} from "@/types/stellarResult"
import type { StarInput } from "@/types/star"
import {
  calcLuminosity,
  calcRadius,
  calcTemperature,
  calcMainSequenceLifetime,
  calcMetallicityCorrection,
  calcRotationCorrection,
  MIN_FUSION_MASS,
  UNIVERSE_AGE_GYR,
} from "@/lib/stellarPhysics"
import {
  classifyByMass,
  getEvolutionPhaseNames,
  determineFinalRemnant,
} from "@/lib/stellarClassification"

// ─────────────────────────────────────────────────────────────────────────────
// FAZ SÜRESİ HESAPLAMALARI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Her evrim fazının süresini [Gyr] cinsinden hesaplar.
 * Tüm süreler Ana Dizi ömrüne göre oransal olarak belirlenir.
 *
 * @param massSolar - Kütle [M☉]
 * @param msLifetimeGyr - Ana Dizi ömrü [Gyr]
 * @param phases - Faz adları listesi
 * @returns Faz adı → süre [Gyr] eşlemesi
 */
function calcPhaseDurations(
  massSolar: number,
  msLifetimeGyr: number,
  phases: StellarPhaseName[]
): Map<StellarPhaseName, number> {
  const durations = new Map<StellarPhaseName, number>()

  // Ana Dizi ömrünü baz al
  const t_ms = msLifetimeGyr

  // Pre-Main Sequence (Hayashi yolu + Henyey yolu)
  // Yüksek kütleli yıldızlar çok hızlı sıkışır
  const preMS = massSolar > 10 ? 1e-4 : massSolar > 2 ? 5e-3 : 0.05

  for (const phase of phases) {
    switch (phase) {
      case "Brown Dwarf":
        durations.set(phase, Infinity)
        break

      case "Pre-Main Sequence":
        durations.set(phase, preMS)
        break

      case "Main Sequence":
        durations.set(phase, t_ms)
        break

      case "Red Dwarf (Eternal)":
        // Kırmızı cüceler evrenin yaşından çok daha uzun süre yaşar
        durations.set(phase, UNIVERSE_AGE_GYR * 1000)
        break

      case "Sub-Giant":
        // Ana Dizi ömrünün ~%1'i
        durations.set(phase, 0.01 * t_ms)
        break

      case "Red Giant Branch":
        // Alçak/orta kütleli: ~%10, yüksek kütleli: daha kısa
        durations.set(phase, massSolar > 5 ? 0.005 * t_ms : 0.10 * t_ms)
        break

      case "Red Supergiant":
        durations.set(phase, 0.01 * t_ms)
        break

      case "Blue Supergiant":
        durations.set(phase, 0.005 * t_ms)
        break

      case "Luminous Blue Variable":
        // LBV fazı çok kısa ve şiddetli (10.000–100.000 yıl)
        durations.set(phase, 1e-4)
        break

      case "Wolf-Rayet":
        // Wolf-Rayet fazı ~100.000 – 500.000 yıl
        durations.set(phase, 2e-4)
        break

      case "Horizontal Branch":
        // ~80 Myr sabit
        durations.set(phase, 0.08)
        break

      case "Asymptotic Giant Branch":
        // Orta kütleli yıldızlarda ~%2 t_ms
        durations.set(phase, 0.02 * t_ms)
        break

      case "Planetary Nebula":
        // ~50.000 yıl
        durations.set(phase, 5e-5)
        break

      case "Core Collapse Supernova":
        // Patlama anı — saniyeler ama etkileri binlerce yıl sürer
        durations.set(phase, 1e-7)
        break

      case "Pair Instability Supernova":
        durations.set(phase, 1e-7)
        break

      case "Hypernova":
        durations.set(phase, 1e-7)
        break

      case "White Dwarf Cooling":
        // Beyaz cüceler trilyonlarca yıl soğur
        durations.set(phase, 1000)
        break

      case "Neutron Star Cooling":
        // Nötron yıldızları milyarlarca yıl soğur
        durations.set(phase, 10)
        break

      case "Black Hole":
        durations.set(phase, Infinity)
        break
    }
  }

  return durations
}

// ─────────────────────────────────────────────────────────────────────────────
// FAZ FİZİKSEL ÖZELLİKLERİ
// ─────────────────────────────────────────────────────────────────────────────

/** Bir faz için sıcaklık, parlaklık ve yarıçap tahmini */
interface PhaseProperties {
  temperatureK: number
  luminositySolar: number
  radiusSolar: number
  color: string
  description: string
  fusionProcess: string
}

/**
 * Her evrim fazı için tahmini fiziksel özellikleri döndürür.
 * Değerler oransal tahmindir; tam MESA simülasyonu değildir.
 */
function getPhaseProperties(
  phase: StellarPhaseName,
  massSolar: number,
  zamsTemp: number,
  zamsLum: number,
  zamsRad: number
): PhaseProperties {
  switch (phase) {
    case "Pre-Main Sequence":
      return {
        temperatureK: zamsTemp * 0.7,
        luminositySolar: zamsLum * 0.5,
        radiusSolar: zamsRad * 2.0,
        color: "#FF8C00",
        description: "Yıldız, yerçekimi ile sıkışarak Ana Dizi'ye henüz ulaşmamış. Deuterium ve lityum yakılıyor.",
        fusionProcess: "Deuterium → Helyum (D + p → ³He + γ)",
      }

    case "Main Sequence":
      return {
        temperatureK: zamsTemp,
        luminositySolar: zamsLum,
        radiusSolar: zamsRad,
        color: tempToColor(zamsTemp),
        description: "Çekirdekte hidrojen helyuma dönüşüyor. Yerçekimi ile radyasyon basıncı dengede. " +
          "Bu en uzun ve en kararlı evre.",
        fusionProcess: "H → He (pp-zinciri veya CNO döngüsü)",
      }

    case "Red Dwarf (Eternal)":
      return {
        temperatureK: zamsTemp,
        luminositySolar: zamsLum,
        radiusSolar: zamsRad,
        color: "#FF4500",
        description: "Bu küçük yıldız trilyonlarca yıl boyunca yanmaya devam edecek. " +
          "Tam konveksiyon sayesinde yakıtı çok verimli kullanır.",
        fusionProcess: "H → He (pp-zinciri, tam karışım)",
      }

    case "Sub-Giant":
      return {
        temperatureK: zamsTemp * 0.95,
        luminositySolar: zamsLum * 2,
        radiusSolar: zamsRad * 1.5,
        color: "#FFD700",
        description: "Çekirdekteki hidrojen tükendi. Kor büzülürken dış katmanlar genişlemeye başladı.",
        fusionProcess: "H → He (kabuk füzyonu başlıyor)",
      }

    case "Red Giant Branch":
      return {
        temperatureK: 4000,
        luminositySolar: zamsLum * 100 * Math.pow(massSolar, 0.5),
        radiusSolar: zamsRad * 50,
        color: "#FF4500",
        description: "Dış katmanlar devasa şekilde genişledi. Çekirdeğin üzerindeki kabukta hidrojen yanıyor. " +
          "Yıldız Güneş'i yutabilecek boyutlara ulaşabilir.",
        fusionProcess: "H → He (kabuk füzyonu)",
      }

    case "Horizontal Branch":
      return {
        temperatureK: 8000 + massSolar * 1000,
        luminositySolar: zamsLum * 50,
        radiusSolar: zamsRad * 10,
        color: "#FFA500",
        description: "Çekirdekte helyum yakılıyor. Yıldız daha kompakt ve sıcak hale geldi. " +
          "Karbon ve oksijen çekirdek birikmeye başlıyor.",
        fusionProcess: "He → C, O (üçlü-alfa süreceni)",
      }

    case "Asymptotic Giant Branch":
      return {
        temperatureK: 3500,
        luminositySolar: zamsLum * 5000,
        radiusSolar: zamsRad * 200,
        color: "#FF2200",
        description: "Hem H hem He kabuk füzyonu aktif. Yoğun yıldız rüzgarları dış katmanları soyuyor. " +
          "Çekirdek ağır elementleri s-süreciyle üretiyor.",
        fusionProcess: "H + He → C, O, s-süreci elementleri",
      }

    case "Red Supergiant":
      return {
        temperatureK: 3500,
        luminositySolar: zamsLum * Math.pow(massSolar / 10, 2) * 10000,
        radiusSolar: zamsRad * 500 * (massSolar / 10),
        color: "#CC2200",
        description: "Devasa, soğuk ve parlak süper-dev. He, C, Ne, O ve Si katman katman yanıyor. " +
          "Soğan kabuğu yapısı oluşuyor. Güçlü kütle kaybı yaşanıyor.",
        fusionProcess: "H, He, C, Ne, O → Si → Fe çekirdek",
      }

    case "Blue Supergiant":
      return {
        temperatureK: 25000,
        luminositySolar: zamsLum * 500000,
        radiusSolar: zamsRad * 25,
        color: "#4169E1",
        description: "Sıcak mavi süper-dev. Aşırı parlaklık ve yoğun UV ışıması var. " +
          "Güçlü yıldız rüzgarları kütlenin büyük bölümünü fırlatıyor.",
        fusionProcess: "He → C, O + CNO (kabuk)",
      }

    case "Luminous Blue Variable":
      return {
        temperatureK: 15000,
        luminositySolar: zamsLum * 1e6,
        radiusSolar: zamsRad * 100,
        color: "#87CEEB",
        description: "Kararsız, aşırı parlak mavi değişken yıldız. Eddington parlaklık sınırına yakın. " +
          "Büyük kütle atımları ve parlama olayları gözlemlenir.",
        fusionProcess: "He → C, O (sıkıştırılmış kor)",
      }

    case "Wolf-Rayet":
      return {
        temperatureK: 50000,
        luminositySolar: zamsLum * 200000,
        radiusSolar: zamsRad * 5,
        color: "#9400D3",
        description: "Hidrojeni soyulmuş yıldız. Yüzey çekirdeğe ait He, C, N, O elementlerini gösteriyor. " +
          "İnanılmaz hızlı rüzgarlar (3000 km/s) kütleyi eritiyor.",
        fusionProcess: "He → C, O (çıplak kor)",
      }

    case "Planetary Nebula":
      return {
        temperatureK: 100000,
        luminositySolar: 10000,
        radiusSolar: 0.1,
        color: "#7FFF00",
        description: "AGB yıldızının dış katmanları uzaya fırlatıldı. İçteki sıcak kor gaz bulutsusunu ışıtıyor. " +
          "Farklı elementlerden gelen renkli emisyon çizgileri gözlemlenir.",
        fusionProcess: "Füzyon yok — radyatif soğuma",
      }

    case "Core Collapse Supernova":
      return {
        temperatureK: 5e9,
        luminositySolar: 1e10,
        radiusSolar: 1e6,
        color: "#FFFF00",
        description: "Demir çekirdeği ani olarak çöker (saniyeler içinde). Nötrino patlaması ve şok dalgası " +
          "dış katmanları evrene fırlatır. Anında oluşan parlaklık tüm galaksiye eşdeğer.",
        fusionProcess: "Füzyon durdu — yerçekimi çöküşü",
      }

    case "Pair Instability Supernova":
      return {
        temperatureK: 1e10,
        luminositySolar: 1e11,
        radiusSolar: 1e7,
        color: "#FF00FF",
        description: "Elektron-pozitron çifti oluşumu çekirdeğin termal basıncını ani düşürür. " +
          "Termoçekirdek patlama yıldızı tamamen parçalar — geriye kalıntı kalmaz. " +
          "En parlak kozmik patlamalardan biri.",
        fusionProcess: "O, Si → Ni-56 (termoçekirdek yıkım)",
      }

    case "Hypernova":
      return {
        temperatureK: 2e10,
        luminositySolar: 1e12,
        radiusSolar: 1e7,
        color: "#FF1493",
        description: "Aşırı kütleli yıldızın katastrofik çöküşü. Gama ışını patlaması (GRB) eşliğinde olabilir. " +
          "Normal süpernovanın 100 katı enerji açığa çıkar.",
        fusionProcess: "Füzyon durdu — hiperatif çöküş",
      }

    case "White Dwarf Cooling":
      return {
        temperatureK: 25000,
        luminositySolar: 0.001,
        radiusSolar: 0.01,
        color: "#E0E0FF",
        description: "Elektron dejenerasyonu ile desteklenen sıkışık kor. Çapı Dünya ile karşılaştırılabilir. " +
          "Füzyon yok — milyarlarca yıl boyunca ışıma ile soğuyor.",
        fusionProcess: "Füzyon yok — Fermi baskısı",
      }

    case "Neutron Star Cooling":
      return {
        temperatureK: 1e6,
        luminositySolar: 0.0001,
        radiusSolar: 0.0001, // ~10 km
        color: "#C0C0FF",
        description: "Nötron dejenerasyonu ile desteklenen aşırı yoğun nesne (~10 km). " +
          "Milisaniye pulsarlar, magnetarlar bu sınıfa girer. X-ışını patlamaları gözlemlenebilir.",
        fusionProcess: "Füzyon yok — nötron baskısı",
      }

    case "Brown Dwarf":
      return {
        temperatureK: 1500,
        luminositySolar: 1e-4,
        radiusSolar: 0.1,
        color: "#8B4513",
        description: "Hidrojen füzyonu için yeterli sıcaklığa ulaşılamadı. " +
          "Deuterium ve lityum kısa süre yanabilir. Yavaşça soğuyarak karanlığa gömülür.",
        fusionProcess: "D, Li → He (kısa süreli)",
      }

    case "Black Hole":
      return {
        temperatureK: 0,
        luminositySolar: 0,
        radiusSolar: (massSolar * 2.95) / 696000, // Schwarzschild yarıçapı R☉ cinsinden
        color: "#000000",
        description: "Işığın bile kaçamadığı uzay-zaman eğriliği. " +
          `Schwarzschild yarıçapı: ~${(massSolar * 2.95).toFixed(0)} km. ` +
          "Hawking ışıması teorik olarak var ama gözlemlenemeyecek kadar zayıf.",
        fusionProcess: "Füzyon yok — tekil nokta",
      }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TAM ZAMAN ÇİZELGESİ OLUŞTURMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yıldızın tam evrim zaman çizelgesini oluşturur.
 *
 * @param input - Yıldız giriş parametreleri
 * @returns Sıralı evrim fazları listesi
 */
export function buildEvolutionTimeline(input: StarInput): StellarPhase[] {
  const { mass, metallicity, rotationRate } = input

  const metalCorr = calcMetallicityCorrection(metallicity)
  const rotCorr = calcRotationCorrection(rotationRate)
  const msLifetime = calcMainSequenceLifetime(mass, metalCorr, rotCorr)

  const phaseNames = getEvolutionPhaseNames(mass)
  const durations = calcPhaseDurations(mass, msLifetime, phaseNames)

  // ZAMS özellikleri
  const zamsLum = calcLuminosity(mass)
  const zamsRad = calcRadius(mass)
  const zamsTemp = calcTemperature(zamsLum, zamsRad)

  const phases: StellarPhase[] = []
  let currentTime = 0

  for (const name of phaseNames) {
    const duration = durations.get(name) ?? 0
    const props = getPhaseProperties(name, mass, zamsTemp, zamsLum, zamsRad)

    phases.push({
      name,
      startGyr: currentTime,
      durationGyr: duration,
      endGyr: currentTime + duration,
      temperatureK: Math.round(props.temperatureK),
      luminositySolar: props.luminositySolar,
      radiusSolar: props.radiusSolar,
      color: props.color,
      description: props.description,
      fusionProcess: props.fusionProcess,
    })

    if (isFinite(duration)) {
      currentTime += duration
    } else {
      break
    }
  }

  return phases
}

// ─────────────────────────────────────────────────────────────────────────────
// HR DİYAGRAM YOLU
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HR diyagramı için evrim yolunu (izokron) oluşturur.
 *
 * @param phases - Evrim fazları listesi
 * @returns HR diyagramı nokta listesi
 */
export function buildHRTrack(phases: StellarPhase[]): HRDiagramPoint[] {
  return phases
    .filter(p => p.temperatureK > 0 && p.luminositySolar > 0)
    .map(p => ({
      logTemperature: parseFloat(Math.log10(p.temperatureK).toFixed(3)),
      logLuminosity: parseFloat(Math.log10(Math.max(1e-6, p.luminositySolar)).toFixed(3)),
      phase: p.name,
      color: p.color,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// KÜTLE-ÖMÜR EĞRİSİ VERİSİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kütle-ömür grafiği için referans veri noktalarını üretir.
 * 0.1 – 100 M☉ aralığında logaritmik örnekleme yapılır.
 *
 * @returns Kütle-ömür veri noktaları
 */
export function buildMassLifetimeCurve(): MassLifetimeDataPoint[] {
  const masses = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0,
    1.2, 1.5, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0,
    10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100,
  ]

  return masses.map(m => {
    const msLife = calcMainSequenceLifetime(m)
    const remnant = determineFinalRemnant(m)
    const phases = getEvolutionPhaseNames(m)
    const durations = calcPhaseDurations(m, msLife, phases)

    let totalLife = 0
    for (const d of durations.values()) {
      if (isFinite(d)) totalLife += d
    }

    const lum = calcLuminosity(m)
    const rad = calcRadius(m)
    const temp = calcTemperature(lum, rad)

    return {
      massSolar: m,
      mainSequenceLifetimeGyr: parseFloat(msLife.toFixed(4)),
      totalLifetimeGyr: parseFloat(totalLife.toFixed(4)),
      remnantType: remnant,
      spectralClass: getSpectralFromTemp(temp),
    }
  })
}

/** Sıcaklıktan basit spektral sınıf tahmini */
function getSpectralFromTemp(t: number) {
  if (t >= 30000) return "O" as const
  if (t >= 10000) return "B" as const
  if (t >= 7500)  return "A" as const
  if (t >= 6000)  return "F" as const
  if (t >= 5200)  return "G" as const
  if (t >= 3700)  return "K" as const
  return "M" as const
}

// ─────────────────────────────────────────────────────────────────────────────
// YARDIMCI FONKSİYONLAR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yüzey sıcaklığından yaklaşık renk kodu döndürür.
 * Blackbody renk eğrisi yaklaşımı.
 */
export function tempToColor(temperatureK: number): string {
  if (temperatureK >= 30000) return "#9BB0FF"  // O — mavi
  if (temperatureK >= 10000) return "#AABFFF"  // B — mavi-beyaz
  if (temperatureK >= 7500)  return "#CAD7FF"  // A — beyaz
  if (temperatureK >= 6000)  return "#F8F7FF"  // F — sarı-beyaz
  if (temperatureK >= 5200)  return "#FFF4EA"  // G — sarı
  if (temperatureK >= 3700)  return "#FFDAB9"  // K — turuncu
  return "#FF6347"                              // M — kırmızı
}

/**
 * Süreyi insan-okunabilir formata dönüştürür.
 *
 * @param gyr - Süre [Gyr]
 * @returns Biçimlendirilmiş metin
 */
export function formatLifetime(gyr: number): string {
  if (!isFinite(gyr) || gyr > 1e12) return "∞ (sonsuz)"
  if (gyr >= 1000)   return `${(gyr / 1000).toFixed(2)} Tyr (Trilyon yıl)`
  if (gyr >= 1)      return `${gyr.toFixed(3)} Gyr (Milyar yıl)`
  if (gyr >= 0.001)  return `${(gyr * 1000).toFixed(2)} Myr (Milyon yıl)`
  if (gyr >= 1e-6)   return `${(gyr * 1e6).toFixed(2)} kyr (Bin yıl)`
  return `${(gyr * 1e9).toFixed(2)} yıl`
}
