/**
 * @fileoverview Stellar Classification Engine — Yıldız Sınıflandırma Motoru
 *
 * Yıldızın kütlesine ve evrim parametrelerine göre:
 * - Nihai kalıntı türünü
 * - Supernova gerçekleşip gerçekleşmeyeceğini
 * - Supernova türünü
 * - İnsan-okunabilir açıklamaları belirler.
 *
 * @module stellarClassification
 */

import type {
  StellarRemnantType,
  StellarPhaseName,
} from "@/types/stellarResult"
import { MIN_FUSION_MASS } from "@/lib/stellarPhysics"

// ─────────────────────────────────────────────────────────────────────────────
// KÜTLESİNE GÖRE YıLDIZ KATEGORİLERİ
// ─────────────────────────────────────────────────────────────────────────────

/** Yıldız kategorisi — evrim yolunu belirler */
export type StellarCategory =
  | "brown_dwarf"          // < 0.08 M☉
  | "red_dwarf"            // 0.08–0.45 M☉ (kırmızı cüce, Ana Dizi'de kalır)
  | "low_mass"             // 0.45–2.0 M☉ (Beyaz Cüce)
  | "intermediate_mass"   // 2.0–8.0 M☉ (Beyaz Cüce — AGB sonrası)
  | "high_mass"            // 8.0–20 M☉ (Nötron Yıldızı)
  | "very_high_mass"       // 20–40 M☉ (Nötron Yıldızı veya Kara Delik)
  | "extreme_mass"         // > 40 M☉ (Kara Delik)

/**
 * Yıldız kütlesinden kategoriyi belirler.
 *
 * @param massSolar - Kütle [M☉]
 * @returns Yıldız kategorisi
 */
export function classifyByMass(massSolar: number): StellarCategory {
  if (massSolar < MIN_FUSION_MASS) return "brown_dwarf"
  if (massSolar < 0.45)            return "red_dwarf"
  if (massSolar < 2.0)             return "low_mass"
  if (massSolar < 8.0)             return "intermediate_mass"
  if (massSolar < 20.0)            return "high_mass"
  if (massSolar < 40.0)            return "very_high_mass"
  return "extreme_mass"
}

// ─────────────────────────────────────────────────────────────────────────────
// NİHAİ KALINTIYI BELİRLEME
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yıldızın nihai kalıntı türünü belirler.
 *
 * Fiziksel sınırlar:
 * - M_initial < 8 M☉  → Beyaz Cüce (Chandrasekhar sınırı altında kor kalır)
 * - M_initial 8–20    → Nötron Yıldızı (çekirdek çöküşü, OV sınırı altında)
 * - M_initial > 20    → Kara Delik (çekirdek kütlesi OV sınırını aşar)
 *
 * @param massSolar - Başlangıç kütlesi [M☉]
 * @param metallicity - [Fe/H] metalikliği (yüksek Z → daha fazla kütle kaybı)
 * @returns Nihai kalıntı türü
 */
export function determineFinalRemnant(
  massSolar: number,
  metallicity: number = 0.0
): StellarRemnantType {
  const category = classifyByMass(massSolar)

  // Metaliklik yüksekse kütle kayıpları daha fazla → sınır biraz kayar
  // Düşük Z → daha az rüzgar → daha ağır kor → kara delik eşiği düşer
  const metallicityShift = metallicity < -2 ? -5 : 0  // Zayıf metal yıldızlar

  switch (category) {
    case "brown_dwarf":
      return "Brown Dwarf"

    case "red_dwarf":
      // Evrenin yaşından daha uzun süre yaşarlar — beyaz cüceye dönüşemezler henüz
      return "Red Dwarf"

    case "low_mass":
    case "intermediate_mass":
      return "White Dwarf"

    case "high_mass":
      return "Neutron Star"

    case "very_high_mass":
      // 20–40 M☉ aralığı belirsiz: çoğunlukla kara delik
      // Yüksek metaliklikte nötron yıldızı da mümkün
      if (massSolar + metallicityShift < 25 && metallicity > -0.5) {
        return "Neutron Star"
      }
      return "Stellar Black Hole"

    case "extreme_mass":
      return massSolar > 100 ? "Intermediate Mass Black Hole" : "Stellar Black Hole"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPERNOVA ANALİZİ
// ─────────────────────────────────────────────────────────────────────────────

/** Supernova tipi */
export type SupernovaType = "Type Ib/c" | "Type II" | "Pair Instability" | "Hypernova"

/**
 * Supernova gerçekleşip gerçekleşmeyeceğini ve türünü belirler.
 *
 * - M < 8 M☉:      Supernova yok (gezegen bulutsusu → beyaz cüce)
 * - 8–20 M☉:       Type II Core Collapse Supernova
 * - 20–40 M☉:      Type Ib/c veya Hypernova (Wolf-Rayet sonrası)
 * - 40–130 M☉:     Hypernova / kollapsar → Kara delik
 * - 130–250 M☉:    Pair Instability Supernova (tam yıkım, kalıntı yok)
 * - > 250 M☉:      Photodisintegration → doğrudan kara delik
 *
 * @param massSolar - Başlangıç kütlesi [M☉]
 * @param metallicity - [Fe/H]
 * @returns Supernova durumu ve türü
 */
export function analyzeSupernova(
  massSolar: number,
  metallicity: number = 0.0
): { willExplode: boolean; type?: SupernovaType } {
  if (massSolar < 8.0) {
    return { willExplode: false }
  }

  if (massSolar < 20.0) {
    return { willExplode: true, type: "Type II" }
  }

  if (massSolar < 40.0) {
    // Yüksek metaliklikte rüzgarlar zarfı soyar → Type Ib/c
    return {
      willExplode: true,
      type: metallicity > -0.5 ? "Type Ib/c" : "Type II",
    }
  }

  if (massSolar < 130.0) {
    return { willExplode: true, type: "Hypernova" }
  }

  if (massSolar < 250.0) {
    return { willExplode: true, type: "Pair Instability" }
  }

  // Çok aşırı kütleli: doğrudan kara deliğe çöküş, zayıf/gizli patlama
  return { willExplode: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVRİM FAZLARI LİSTESİ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Yıldızın geçireceği evrim fazlarını sıralı liste halinde döndürür.
 *
 * @param massSolar - Başlangıç kütlesi [M☉]
 * @returns Faz adlarının sıralı listesi
 */
export function getEvolutionPhaseNames(massSolar: number): StellarPhaseName[] {
  const category = classifyByMass(massSolar)

  switch (category) {
    case "brown_dwarf":
      return ["Pre-Main Sequence", "Brown Dwarf"]

    case "red_dwarf":
      return ["Pre-Main Sequence", "Main Sequence", "Red Dwarf (Eternal)"]

    case "low_mass":
      return [
        "Pre-Main Sequence",
        "Main Sequence",
        "Sub-Giant",
        "Red Giant Branch",
        "Horizontal Branch",
        "Asymptotic Giant Branch",
        "Planetary Nebula",
        "White Dwarf Cooling",
      ]

    case "intermediate_mass":
      return [
        "Pre-Main Sequence",
        "Main Sequence",
        "Sub-Giant",
        "Red Giant Branch",
        "Horizontal Branch",
        "Asymptotic Giant Branch",
        "Planetary Nebula",
        "White Dwarf Cooling",
      ]

    case "high_mass":
      return [
        "Pre-Main Sequence",
        "Main Sequence",
        "Sub-Giant",
        "Red Supergiant",
        "Core Collapse Supernova",
        "Neutron Star Cooling",
      ]

    case "very_high_mass":
      return [
        "Pre-Main Sequence",
        "Main Sequence",
        "Luminous Blue Variable",
        "Wolf-Rayet",
        massSolar < 30 ? "Core Collapse Supernova" : "Hypernova",
        "Black Hole",
      ]

    case "extreme_mass":
      if (massSolar >= 130 && massSolar < 250) {
        return [
          "Pre-Main Sequence",
          "Main Sequence",
          "Luminous Blue Variable",
          "Pair Instability Supernova",
        ]
      }
      return [
        "Pre-Main Sequence",
        "Main Sequence",
        "Luminous Blue Variable",
        "Hypernova",
        "Black Hole",
      ]
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NİHAİ KALINTIYI AÇIKLAMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Nihai kalıntı için insan-okunabilir bilimsel açıklama üretir.
 *
 * @param remnant - Kalıntı türü
 * @param massSolar - Başlangıç kütlesi [M☉]
 * @returns Açıklama metni
 */
export function describeRemnant(
  remnant: StellarRemnantType,
  massSolar: number
): string {
  switch (remnant) {
    case "Brown Dwarf":
      return `${massSolar.toFixed(2)} M☉ kütlesiyle bu cisim hiçbir zaman çekirdek hidrojen füzyonunu başlatamaz. ` +
        "Kahverengi cüce olarak soğuyarak karanlık bir cisim haline gelir."

    case "Red Dwarf":
      return `${massSolar.toFixed(2)} M☉ kütlesiyle bu yıldız evrenin mevcut yaşından çok daha uzun yaşayacak. ` +
        "Trilyonlarca yıl boyunca çok düşük parlaklıkta yanmaya devam edecek, ardından lityum sürerek " +
        "yavaşça 'karanlık' bir cüceye dönüşecek. Şu an beyaz cüceye dönüşmesi için yeterli zaman geçmedi."

    case "White Dwarf":
      return `Bu yıldız yaşamının sonunda dış katmanlarını bir gezegen bulutsusuna fırlatacak ` +
        `ve geriye Chandrasekhar sınırının (1.44 M☉) altında, yoğun sıcak bir Beyaz Cüce kalacak. ` +
        "Artık füzyon gerçekleşmez; ışıma yoluyla milyarlarca yıl boyunca soğur."

    case "Neutron Star":
      return `${massSolar.toFixed(1)} M☉ başlangıç kütlesiyle bu yıldız Tip II çekirdek çöküş ` +
        "süpernova patlamasıyla sonlanır. Çekirdek, yaklaşık 20 km çaplı aşırı yoğun bir " +
        "Nötron Yıldızına çöker. Pulsarlar ve magnetarlar bu sınıfın üyeleridir."

    case "Stellar Black Hole":
      return `${massSolar.toFixed(1)} M☉ başlangıç kütlesiyle bu yıldız, ` +
        "son evrimde çekirdek kütlesi Oppenheimer-Volkoff sınırını (3 M☉) aştığında " +
        "karanlığa çöker ve etrafında kaybolma noktası (event horizon) oluşan " +
        "bir Yıldızsökel Kara Delik bırakır."

    case "Intermediate Mass Black Hole":
      return `${massSolar.toFixed(0)} M☉ gibi aşırı kütlesiyle bu yıldız, ` +
        "kararsızlığa bağlı çöküş veya çift çiftleşme (pair instability) sonrasında " +
        "olağandışı kütleli bir Kara Delik bırakabilir. " +
        "Bu tür nesneler galaksi merkezlerindeki süper kütleli kara deliklerin öncülleri olabilir."
  }
}
