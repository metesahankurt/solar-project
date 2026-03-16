export type EventRecord = {
  id: string
  name: string
  sourceType: string
  observationDate: string
  detectors: string
  primaryMass: number
  secondaryMass: number
  finalMass: number
  luminosityDistanceMpc: number
  chirpMass: number
  networkSnr: number
  peakStrain: number
  peakFrequencyHz: number
  modeledDurationSeconds: number
  sourceUrl: string
  sourceLabel: string
}

export const GW_EVENTS: EventRecord[] = [
  {
    id: "gw150914",
    name: "GW150914",
    sourceType: "İkili kara delik birleşmesi",
    observationDate: "2015-09-14",
    detectors: "LIGO Hanford + LIGO Livingston",
    primaryMass: 36.2,
    secondaryMass: 29.1,
    finalMass: 62.3,
    luminosityDistanceMpc: 420,
    chirpMass: 28.1,
    networkSnr: 24,
    peakStrain: 1.0e-21,
    peakFrequencyHz: 150,
    modeledDurationSeconds: 0.24,
    sourceUrl: "https://gwosc.org/events/GW150914/",
    sourceLabel: "GWOSC GW150914 data release",
  },
  {
    id: "gw170817",
    name: "GW170817",
    sourceType: "İkili nötron yıldızı birleşmesi",
    observationDate: "2017-08-17",
    detectors: "LIGO Hanford + LIGO Livingston + Virgo",
    primaryMass: 1.46,
    secondaryMass: 1.27,
    finalMass: 2.8,
    luminosityDistanceMpc: 40,
    chirpMass: 1.186,
    networkSnr: 30.9,
    peakStrain: 3.5e-22,
    peakFrequencyHz: 700,
    modeledDurationSeconds: 18,
    sourceUrl: "https://gwosc.org/events/GW170817/",
    sourceLabel: "GWOSC GW170817 data release",
  },
  {
    id: "gw190521",
    name: "GW190521",
    sourceType: "Yüksek kütleli ikili kara delik birleşmesi",
    observationDate: "2019-05-21",
    detectors: "LIGO Hanford + LIGO Livingston + Virgo",
    primaryMass: 91.4,
    secondaryMass: 66.8,
    finalMass: 150.3,
    luminosityDistanceMpc: 4530,
    chirpMass: 66.9,
    networkSnr: 14.4,
    peakStrain: 4.5e-22,
    peakFrequencyHz: 60,
    modeledDurationSeconds: 0.16,
    sourceUrl: "https://gwosc.org/eventapi/html/GWTC-2/GW190521/",
    sourceLabel: "GWOSC GW190521 detail page",
  },
]
