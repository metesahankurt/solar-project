/**
 * @fileoverview Yıldız Evrimi Modülü — Giriş Sayfası
 * Modülü tanıtır, bilimsel arka planı açıklar ve simülatöre yönlendirir.
 */

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MathDisplay } from "@/components/ui/math-display"
import {
  ArrowRight,
  Star,
  Zap,
  Clock,
  Atom,
  FlaskConical,
  Telescope,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// KADER TABLOSU VERİSİ
// ─────────────────────────────────────────────────────────────────────────────

const FATE_TABLE = [
  {
    range: "< 0.08 M☉",
    category: "Kahverengi Cüce",
    outcome: "Füzyon başlamaz",
    color: "#8B4513",
    badge: "variant" as const,
  },
  {
    range: "0.08 – 0.45 M☉",
    category: "Kırmızı Cüce",
    outcome: "Trilyon yıl yaşar",
    color: "#FF4500",
    badge: "secondary" as const,
  },
  {
    range: "0.45 – 8 M☉",
    category: "Güneş benzeri",
    outcome: "Beyaz Cüce",
    color: "#E0E0FF",
    badge: "default" as const,
  },
  {
    range: "8 – 20 M☉",
    category: "Yüksek Kütleli",
    outcome: "Nötron Yıldızı",
    color: "#87CEEB",
    badge: "outline" as const,
  },
  {
    range: "> 20 M☉",
    category: "Aşırı Kütleli",
    outcome: "Kara Delik",
    color: "#9400D3",
    badge: "destructive" as const,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SAYFA
// ─────────────────────────────────────────────────────────────────────────────

export default function StellarEvolutionPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-10">
      {/* Başlık */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Star className="size-9 text-primary" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Yıldız Evrimi Simülatörü
            </h1>
            <p className="text-muted-foreground mt-1">
              Stellar Evolution Calculator — Bilimsel Astrofizik Modeli
            </p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Yıldızların kütlesine bağlı olarak nasıl doğup, yaşayıp, öldüğünü
          hesaplayın. Ana Dizi ömründen nihai kalıntıya kadar eksiksiz evrim
          simülasyonu yapın.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/stellar-evolution/simulator">
              <FlaskConical className="size-4 mr-2" />
              Simülatörü Başlat
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/stellar-evolution/visualization">
              <Telescope className="size-4 mr-2" />
              3D Görselleştirme
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Özellik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<Clock className="size-5" />}
          title="Stellar Ömür"
          description="Ana Dizi ömrü ve her evrim fazının süresi hesaplanır."
        />
        <FeatureCard
          icon={<Star className="size-5" />}
          title="Fiziksel Özellikler"
          description="Parlaklık, yarıçap, sıcaklık ve spektral sınıf."
        />
        <FeatureCard
          icon={<Zap className="size-5" />}
          title="Supernova Analizi"
          description="Tip II, Ib/c, Hypernova ve Çift Kararlılık patlamaları."
        />
        <FeatureCard
          icon={<Atom className="size-5" />}
          title="Nihai Kalıntı"
          description="Beyaz Cüce, Nötron Yıldızı veya Kara Delik tahmini."
        />
      </div>

      {/* Bilimsel Model Açıklaması */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ana Dizi Ömrü */}
        <Card>
          <CardHeader>
            <CardTitle>Ana Dizi Ömür Modeli</CardTitle>
            <CardDescription>
              Enerji bütçesi argümanından türetilmiş kütle-ömür ilişkisi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bir yıldız enerji üretimini kütlesini yakarak karşılar.
              Parlaklık kütleyle güçlü şekilde arttığından, daha kütleli
              yıldızlar çok daha hızlı yanar.
            </p>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay formula="t_{MS} = t_\odot \cdot \frac{M/M_\odot}{L/L_\odot}" block />
              <div className="text-xs text-muted-foreground">Enerji Bütçesi Yaklaşımı</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay formula="L \propto M^{3.5} \Rightarrow t_{MS} \propto M^{-2.5}" block />
              <div className="text-xs text-muted-foreground">
                Kütle-Parlaklık ilişkisi uygulandığında
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay formula="t_{MS} \approx 10 \times \left(\frac{M}{M_\odot}\right)^{-2.5} \text{ Gyr}" block />
              <div className="text-xs text-muted-foreground">
                Basitleştirilmiş ampirik form (Güneş = 10 Gyr)
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Simülatörde metaliklik ve dönüş hızı düzeltmeleri de uygulanır.
            </p>
          </CardContent>
        </Card>

        {/* Kader Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle>Yıldız Kaderleri</CardTitle>
            <CardDescription>
              Başlangıç kütlesine göre nihai kalıntı ve evrim yolu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {FATE_TABLE.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40"
                  style={{ borderLeftColor: row.color, borderLeftWidth: "3px" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{row.range}</div>
                    <div className="text-xs text-muted-foreground">{row.category}</div>
                  </div>
                  <Badge variant={row.badge as "default" | "secondary" | "destructive" | "outline"}>
                    {row.outcome}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metaliklik ve Dönüş Etkileri */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metaliklik Etkisi</CardTitle>
            <CardDescription>[Fe/H] — Güneş metalikliğine göre logaritmik oran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Metaliklik yıldızın opasite yapısını etkiler. Düşük metalikli
              yıldızlar (Popülasyon II ve III) daha şeffaf olduktan enerjiyi
              daha verimli iletir ve hafif daha uzun süre yaşar.
            </p>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="\text{Düzeltme} \approx 1 + 0.15 \times \frac{-[\text{Fe/H}]}{2}"
                block
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">Pop. III</div>
                <div className="text-muted-foreground">[Fe/H] ≈ -4</div>
                <div className="text-green-500">+30% ömür</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">Güneş</div>
                <div className="text-muted-foreground">[Fe/H] = 0</div>
                <div>Baz değer</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">Metal-Zengin</div>
                <div className="text-muted-foreground">[Fe/H] = +0.5</div>
                <div className="text-red-400">-3.75% ömür</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dönüş Etkisi</CardTitle>
            <CardDescription>v/v_crit — Kritik dönüş hızının oranı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Hızlı dönen yıldızlarda rotasyonel karışım (rotational mixing)
              daha fazla yakıtı çekirdeğe taşır. Bu ömrü %10'a kadar uzatabilir.
              Ancak çok hızlı dönüş kütitle kaybını artırarak zıt etki yaratır.
            </p>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="\Omega \text{ artışı} \Rightarrow \text{daha derin karışım} \Rightarrow \text{uzun ömür}"
                block
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">v/v_crit = 0.3</div>
                <div className="text-green-500">+6% ömür uzaması</div>
                <div className="text-muted-foreground">Optimal dönüş</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">v/v_crit = 0.9</div>
                <div className="text-red-400">-8% ömür kısalması</div>
                <div className="text-muted-foreground">Kütle kaybı baskın</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="text-center py-6 space-y-4 border rounded-xl bg-muted/20">
        <h2 className="text-2xl font-bold">Simülasyonu Deneyin</h2>
        <p className="text-muted-foreground">
          Bir yıldız seçin veya kendi parametrelerinizi girerek evrimini izleyin.
        </p>
        <Button asChild size="lg">
          <Link href="/stellar-evolution/simulator">
            <FlaskConical className="size-4 mr-2" />
            Simülatöre Git
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
