/**
 * @fileoverview Kütleçekim Dalgaları Modülü — Giriş Sayfası
 * Modülü tanıtır, fizik arka planını açıklar ve interaktif lab + simülasyona yönlendirir.
 */

import React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MathDisplay } from "@/components/ui/math-display"
import {
  ArrowRight,
  Waves,
  Radio,
  Activity,
  Radar,
  Database,
} from "lucide-react"
import { GravitationalWaveLab } from "@/components/gravitational-wave-simulator/gravitational-wave-lab"

export const metadata: Metadata = {
  title: "Kütleçekim Dalgaları Simülasyonu",
  description:
    "LIGO/Virgo/GWOSC resmi olay parametreleriyle etkileşimli kütleçekim dalgası laboratuvarı.",
}

// ─────────────────────────────────────────────────────────────────────────────
// GW OLAY KATALOĞU
// GWOSC yayınlarından alınan seçilmiş önemli tespitler
// ─────────────────────────────────────────────────────────────────────────────

const GW_CATALOG = [
  {
    name: "GW150914",
    type: "İkili kara delik",
    m1: "36.2",
    m2: "29.1",
    mf: "62.3",
    chirpMass: "28.1",
    dist: "410 Mpc",
    snr: "24.0",
    date: "14 Eyl 2015",
    ref: "Abbott et al. 2016",
    color: "#4ade80",
    note: "İlk doğrudan tespit",
  },
  {
    name: "GW151226",
    type: "İkili kara delik",
    m1: "14.2",
    m2: "7.5",
    mf: "20.8",
    chirpMass: "8.9",
    dist: "440 Mpc",
    snr: "13.0",
    date: "26 Ara 2015",
    ref: "Abbott et al. 2016b",
    color: "#4ade80",
    note: "O1 döneminin ikinci tespiti",
  },
  {
    name: "GW170817",
    type: "İkili nötron yıldızı",
    m1: "1.46",
    m2: "1.27",
    mf: "2.8",
    chirpMass: "1.19",
    dist: "40 Mpc",
    snr: "30.9",
    date: "17 Ağu 2017",
    ref: "Abbott et al. 2017",
    color: "#60a5fa",
    note: "Çok-mesajcı astronomi dönüm noktası",
  },
  {
    name: "GW190521",
    type: "Ağır ikili kara delik",
    m1: "91.4",
    m2: "66.8",
    mf: "150.3",
    chirpMass: "66.9",
    dist: "5 300 Mpc",
    snr: "14.4",
    date: "21 May 2019",
    ref: "Abbott et al. 2020",
    color: "#f97316",
    note: "İlk orta-kütle kara delik adayı",
  },
  {
    name: "GW190814",
    type: "Asimetrik ikili",
    m1: "23.2",
    m2: "2.6",
    mf: "25.6",
    chirpMass: "6.1",
    dist: "241 Mpc",
    snr: "25.0",
    date: "14 Ağu 2019",
    ref: "Abbott et al. 2020b",
    color: "#a78bfa",
    note: "Bilinmeyen kompakt nesne (2.6 M☉)",
  },
  {
    name: "GW200105",
    type: "NSBH birleşmesi",
    m1: "8.9",
    m2: "1.9",
    mf: "10.5",
    chirpMass: "3.4",
    dist: "280 Mpc",
    snr: "13.9",
    date: "5 Oca 2020",
    ref: "Abbott et al. 2021",
    color: "#fb923c",
    note: "İlk doğrulanan NSBH tespiti",
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// SAYFA
// ─────────────────────────────────────────────────────────────────────────────

export default function GravitationalWavePage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-10">

      {/* Başlık */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Waves className="size-9 text-primary" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Kütleçekim Dalgaları
            </h1>
            <p className="text-muted-foreground mt-1">
              Gravitational Wave Laboratory — LIGO / Virgo / GWOSC Resmi Parametreleri
            </p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Einstein alan denklemlerinden çıkan uzay-zaman pertürbasyonlarını, gerçek tespit
          olaylarının kütle ve uzaklık parametreleriyle görselleştirin. Chirp sinyalini,
          inspiral–merger–ringdown fazlarını ve spacetime grid animasyonunu keşfedin.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="#gw-lab">
              <Activity className="size-4 mr-2" />
              Laboratuvara Git
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/gravitational-wave/simulation">
              <Radar className="size-4 mr-2" />
              3D Simülasyon
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Özellik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<Waves className="size-5" />}
          title="Strain h(t)"
          description="Dedektör kol uzunluğundaki bağıl değişimi zaman alanında chirp sinyali olarak izleyin."
        />
        <FeatureCard
          icon={<Activity className="size-5" />}
          title="İkili Birleşme Fazları"
          description="İnspiral, merger ve ringdown fazları tek bir dalga formunda okunabilir hale gelir."
        />
        <FeatureCard
          icon={<Radio className="size-5" />}
          title="SNR ve Uzaklık"
          description="Aynı olayın dedektörde neden daha güçlü ya da zayıf göründüğünü mesafe üzerinden test edin."
        />
        <FeatureCard
          icon={<Radar className="size-5" />}
          title="Spacetime Grid"
          description="Kütleçekim dalgasının uzay-zamanda oluşturduğu periyodik sıkışma ve gerilme alanı."
        />
      </div>

      {/* Chirp Kütlesi + Strain Genliği */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Chirp Kütlesi</CardTitle>
            <CardDescription>
              Gözlemsel olarak en iyi ölçülebilen ikili sistem parametresi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Chirp kütlesi, iki kompakt cismin frekans evrimi üzerindeki baskın etkisini
              özetler. İnspiral faz boyunca gözlemlenen <em>df/dt</em> doğrudan chirp kütlesini
              belirler ve uzaklıktan bağımsız olarak ölçülebilir.
            </p>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay
                formula="\mathcal{M}_c = \frac{(m_1 m_2)^{3/5}}{(m_1 + m_2)^{1/5}}"
                block
              />
              <div className="text-xs text-muted-foreground">Chirp kütlesi tanımı</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { name: "GW150914", mc: "28.1 M☉", type: "BBH" },
                { name: "GW170817", mc: "1.19 M☉", type: "BNS" },
                { name: "GW190521", mc: "66.9 M☉", type: "Ağır BBH" },
              ].map(({ name, mc, type }) => (
                <div key={name} className="bg-muted/50 rounded p-2">
                  <div className="font-bold">{name}</div>
                  <div className="text-muted-foreground font-mono">{mc}</div>
                  <div className="text-primary">{type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strain Genliği</CardTitle>
            <CardDescription>Uzay-zamanın bağıl gerilmesi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Strain h, kütleçekim dalgasının dedektör kollarında yarattığı bağıl uzunluk
              değişimidir. Chirp kütlesiyle ve frekansla güçlü biçimde artar; kaynağa olan
              ışıklık uzaklığıyla azalır.
            </p>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay
                formula="h \approx \frac{4}{D_L} \left(\frac{G\mathcal{M}_c}{c^2}\right)^{5/3} \frac{(\pi f)^{2/3}}{c^2}"
                block
              />
              <div className="text-xs text-muted-foreground">Kuadrupol yaklaşımı (zayıf alan)</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay
                formula="h \propto \frac{\mathcal{M}_c^{5/3}\, f^{2/3}}{D_L}"
                block
              />
              <div className="text-xs text-muted-foreground">
                GW150914 peak strain ≈ 10⁻²¹ — atom çapının 1/1000&apos;i kadar
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frekans Evrimi + Birleşme Süresi */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İnspiral Frekans Evrimi</CardTitle>
            <CardDescription>Enerji kaybettikçe yükselen chirp sesi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Birleşen ikili sistem kütleçekim dalgası yayarak enerji kaybeder. Bu
              kayıp yörüngenin daralmasına, dolayısıyla frekansın artmasına neden olur —
              detektörde duyulan karakteristik &quot;chirp&quot; sesi budur.
            </p>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="\frac{df}{dt} = \frac{96}{5}\,\pi^{8/3} \left(\frac{G\mathcal{M}_c}{c^3}\right)^{5/3} f^{11/3}"
                block
              />
              <div className="text-xs text-muted-foreground">Post-Newtonian yaklaşımı (0PN terimi)</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">GW150914</div>
                <div className="text-muted-foreground">35 Hz → 150 Hz</div>
                <div>≈ 0.24 s</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">GW170817</div>
                <div className="text-muted-foreground">25 Hz → 700 Hz</div>
                <div>≈ 18 s</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Birleşme Zamanı</CardTitle>
            <CardDescription>Peters formülü — yörünge çöküş süresi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Başlangıç yörünge yarıçapı <em>a₀</em> ile verilen dairesel ikili sistemin
              kütleçekim dalgası kaybı nedeniyle birleşmesi için geçen süre:
            </p>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="t_{merge} = \frac{5}{256}\,\frac{c^5}{G^3}\,\frac{a_0^4}{m_1 m_2 (m_1+m_2)}"
                block
              />
              <div className="text-xs text-muted-foreground">Peters (1964) yörünge ömrü</div>
            </div>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="\frac{dE}{dt} = -\frac{32}{5}\,\frac{G^4}{c^5}\,\frac{(m_1 m_2)^2(m_1+m_2)}{a^5}"
                block
              />
              <div className="text-xs text-muted-foreground">Kütleçekim dalgası güç kaybı</div>
            </div>
            <p className="text-xs text-muted-foreground">
              GW150914 için birleşmeden önce son 0.2 s&apos;de yayılan güç, tüm evrendeki
              gözlemlenebilir yıldızların ışıma gücünü geçer: ~3.6 × 10⁵⁶ erg/s.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lineer Pertürbasyon Teorisi + Kuadrupol Formülü */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lineer Pertürbasyon Teorisi</CardTitle>
            <CardDescription>Kütleçekim dalgalarının matematiksel temeli</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Zayıf alan sınırında metrik tensör, düz Minkowski metriğine küçük bir pertürbasyon
              olarak yazılır. Bu lineerleştirilmiş Einstein denklemleri dalga denklemine indirgenir.
            </p>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu},\quad |h_{\mu\nu}| \ll 1"
                block
              />
              <div className="text-xs text-muted-foreground">Metrik pertürbasyon ayrıştırması</div>
            </div>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="\Box\,\bar{h}_{\mu\nu} = -\frac{16\pi G}{c^4}\,T_{\mu\nu}"
                block
              />
              <div className="text-xs text-muted-foreground">
                Lorentz ayarında lineerleştirilmiş Einstein denklemi
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kuadrupol Işıma Formülü</CardTitle>
            <CardDescription>Kütleçekim dalgası üretiminin birinci dereceden tahmini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Uzak alandaki kütleçekim dalgası genliği, kaynak kütlesinin ikinci moment tensörünün
              ikinci türevine orantılıdır — Einstein&apos;ın 1918&apos;de türettiği kuadrupol formülü:
            </p>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="h_{ij}^{TT} = \frac{2G}{c^4 D_L}\,\ddot{I}_{ij}^{TT}(t - D_L/c)"
                block
              />
              <div className="text-xs text-muted-foreground">
                Transverse-Traceless ayarında uzak alan strain tensörü
              </div>
            </div>
            <div className="bg-muted rounded p-3 text-center space-y-1">
              <MathDisplay
                formula="I_{ij} = \int \rho\, x_i x_j\, d^3x"
                block
              />
              <div className="text-xs text-muted-foreground">Kuadrupol moment tensörü</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GW Olay Kataloğu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4" />
            GWOSC Olay Kataloğu
          </CardTitle>
          <CardDescription>
            LIGO-Virgo-KAGRA işbirliğinin resmi GWOSC yayınlarından seçilmiş tarihsel
            kütleçekim dalgası tespitleri.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Olay</th>
                  <th className="text-left py-2 pr-3 font-medium">Tür</th>
                  <th className="text-left py-2 pr-3 font-medium">M1 / M2</th>
                  <th className="text-left py-2 pr-3 font-medium">Mf</th>
                  <th className="text-left py-2 pr-3 font-medium">Chirp M</th>
                  <th className="text-left py-2 pr-3 font-medium">Uzaklık</th>
                  <th className="text-left py-2 pr-3 font-medium">SNR</th>
                  <th className="text-left py-2 font-medium">Referans</th>
                </tr>
              </thead>
              <tbody>
                {GW_CATALOG.map((ev, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                    style={{ borderLeftColor: ev.color, borderLeftWidth: "3px" }}
                  >
                    <td className="py-2 pr-3">
                      <div className="font-semibold" style={{ color: ev.color }}>{ev.name}</div>
                      <div className="text-muted-foreground">{ev.date}</div>
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{ev.type}</td>
                    <td className="py-2 pr-3 font-mono">{ev.m1} / {ev.m2} M☉</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{ev.mf} M☉</td>
                    <td className="py-2 pr-3 font-mono">{ev.chirpMass} M☉</td>
                    <td className="py-2 pr-3 text-muted-foreground">{ev.dist}</td>
                    <td className="py-2 pr-3 font-mono">{ev.snr}</td>
                    <td className="py-2 text-muted-foreground">
                      <div>{ev.ref}</div>
                      <div className="text-primary/70 italic">{ev.note}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* İnteraktif Lab */}
      <section id="gw-lab">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">İnteraktif Laboratuvar</h2>
          <p className="text-muted-foreground mt-1">
            Gerçek GWOSC olaylarını seçin, kütle ve uzaklık ölçeklerini ayarlayın, chirp
            sinyalini ve faz geçişlerini canlı olarak gözlemleyin.
          </p>
        </div>
        <GravitationalWaveLab />
      </section>

      {/* CTA */}
      <div className="text-center py-6 space-y-4 border rounded-xl bg-muted/20">
        <h2 className="text-2xl font-bold">3D Simülasyonu Deneyin</h2>
        <p className="text-muted-foreground">
          İki kompakt cismin birleşmesini, spacetime grid animasyonunu ve dalganın
          uzay-zamanda yayılmasını tam ekran görselleştirin.
        </p>
        <Button asChild size="lg">
          <Link href="/gravitational-wave/simulation">
            <Radar className="size-4 mr-2" />
            3D Simülasyonu Aç
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ÖZELLIK KARTI BİLEŞENİ
// ─────────────────────────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="text-primary mb-2">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
