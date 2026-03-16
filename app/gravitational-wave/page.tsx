import type { Metadata } from "next"

import { GravitationalWaveLab } from "@/components/gravitational-wave-simulator/gravitational-wave-lab"

export const metadata: Metadata = {
  title: "Gravitational Wave Simülasyonu",
  description: "LIGO/Virgo/GWOSC resmi olay parametreleriyle etkileşimli kütleçekim dalgası laboratuvarı.",
}

export default function GravitationalWavePage() {
  return <GravitationalWaveLab />
}
