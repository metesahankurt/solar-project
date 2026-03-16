/**
 * @fileoverview Black Hole Simulator — Landing / Intro Page
 *
 * Introduces the simulator, explains the physics, and links to the
 * interactive 3D simulation.
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
  Circle,
  Orbit,
  Atom,
  Telescope,
  Timer,
  Waves,
  Layers,
  Database,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVED BLACK HOLE CATALOG
// Masses, distances and discovery references from peer-reviewed literature
// ─────────────────────────────────────────────────────────────────────────────

const CATALOG = [
  {
    name: "Cygnus X-1",
    type: "Stellar",
    mass: "21.2 ± 2.2 M☉",
    rs: "~62.6 km",
    distance: "1.86 kpc",
    method: "Stellar dynamics + parallax",
    ref: "Reid et al. 2011",
    color: "#88ccff",
  },
  {
    name: "GRS 1915+105",
    type: "Stellar",
    mass: "12.4⁺²·⁰₋₁.₈ M☉",
    rs: "~36.6 km",
    distance: "8.6 kpc",
    method: "Optical spectroscopy",
    ref: "McClintock et al. 2006",
    color: "#88ccff",
  },
  {
    name: "GW150914",
    type: "Stellar (merger)",
    mass: "62⁺⁴₋₄ M☉",
    rs: "~183 km",
    distance: "410 Mpc",
    method: "Gravitational waves (LIGO)",
    ref: "Abbott et al. 2016",
    color: "#aaffcc",
  },
  {
    name: "GW190521",
    type: "Intermediate (merger)",
    mass: "142⁺²⁸₋₁₆ M☉",
    rs: "~419 km",
    distance: "5.3 Gpc",
    method: "Gravitational waves (LIGO/Virgo)",
    ref: "Abbott et al. 2020",
    color: "#ffccaa",
  },
  {
    name: "Sgr A*",
    type: "Supermassive",
    mass: "(4.154 ± 0.014) × 10⁶ M☉",
    rs: "~12.27 × 10⁶ km",
    distance: "8.277 kpc",
    method: "Stellar orbits (S2) + VLBI",
    ref: "GRAVITY Collab. 2022",
    color: "#ffaa44",
  },
  {
    name: "M87*",
    type: "Supermassive",
    mass: "(6.5 ± 0.7) × 10⁹ M☉",
    rs: "~19.2 × 10⁹ km",
    distance: "16.8 Mpc",
    method: "EHT imaging + stellar velocities",
    ref: "EHT Collaboration 2019",
    color: "#ff8844",
  },
  {
    name: "NGC 1277",
    type: "Ultramassive",
    mass: "~1.7 × 10¹⁰ M☉",
    rs: "~5 × 10¹⁰ km",
    distance: "73 Mpc",
    method: "Stellar kinematics",
    ref: "van den Bosch et al. 2012",
    color: "#ff4444",
  },
  {
    name: "TON 618",
    type: "Ultramassive",
    mass: "6.6 × 10¹⁰ M☉",
    rs: "~1.95 × 10¹¹ km",
    distance: "10.4 Gpc",
    method: "Reverberation mapping",
    ref: "Shemmer et al. 2004",
    color: "#ff2222",
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// KEY RADII DATA
// ─────────────────────────────────────────────────────────────────────────────

const KEY_RADII = [
  {
    radius: "r = 0",
    name: "Singularity",
    description: "Point of infinite density. Spacetime curvature diverges.",
    color: "#ff0000",
    badge: "destructive" as const,
  },
  {
    radius: "r = Rs",
    name: "Event Horizon",
    description: "Boundary of no return. Escape velocity = c.",
    color: "#ff4400",
    badge: "destructive" as const,
  },
  {
    radius: "r = 1.5 Rs",
    name: "Photon Sphere",
    description: "Unstable circular orbits for photons. Light can orbit the black hole.",
    color: "#ffaa00",
    badge: "secondary" as const,
  },
  {
    radius: "r = 2 Rs",
    name: "Marginally Bound Orbit",
    description: "Lowest energy parabolic orbit. Just barely escapes if given an impulse.",
    color: "#ffcc44",
    badge: "secondary" as const,
  },
  {
    radius: "r = 3 Rs",
    name: "ISCO",
    description: "Innermost Stable Circular Orbit. Inside this, all orbits spiral inward.",
    color: "#44ff88",
    badge: "default" as const,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function BlackHoleSimulatorPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-10">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Circle className="size-9 text-primary fill-black stroke-primary" />
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Black Hole Simulator
            </h1>
            <p className="text-muted-foreground mt-1">
              Schwarzschild Spacetime — Interactive General Relativistic Physics Engine
            </p>
          </div>
        </div>

        <p className="text-lg text-muted-foreground max-w-3xl">
          Explore the extreme physics of black holes: event horizons, gravitational lensing,
          accretion disks, relativistic time dilation, and orbital mechanics — all modeled
          from Einstein&apos;s general theory of relativity.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/black-hole-simulator/simulation">
              <Orbit className="size-4 mr-2" />
              Launch Simulator
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<Circle className="size-5" />}
          title="Event Horizon"
          description="Visualize the boundary from which nothing — not even light — can escape."
        />
        <FeatureCard
          icon={<Waves className="size-5" />}
          title="Gravitational Lensing"
          description="Watch light bend around the photon sphere, producing Einstein rings."
        />
        <FeatureCard
          icon={<Layers className="size-5" />}
          title="Accretion Disk"
          description="Temperature-graded disk of infalling matter, glowing at millions of degrees."
        />
        <FeatureCard
          icon={<Timer className="size-5" />}
          title="Time Dilation"
          description="See how clocks slow down near the event horizon — an extreme relativistic effect."
        />
      </div>

      {/* Schwarzschild Metric */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schwarzschild Metric</CardTitle>
            <CardDescription>
              The exact vacuum solution to Einstein&apos;s field equations for a spherical mass
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Schwarzschild metric describes spacetime geometry outside a
              non-rotating, uncharged spherical mass. It is the exact solution
              to Einstein&apos;s field equations in vacuum:
            </p>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay
                formula="ds^2 = -\left(1 - \frac{R_s}{r}\right)c^2\,dt^2 + \left(1 - \frac{R_s}{r}\right)^{-1}dr^2 + r^2\,d\Omega^2"
                block
              />
              <div className="text-xs text-muted-foreground">Line element in Schwarzschild coordinates</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center space-y-2">
              <MathDisplay
                formula="R_s = \frac{2GM}{c^2}"
                block
              />
              <div className="text-xs text-muted-foreground">Schwarzschild radius — event horizon boundary</div>
            </div>
            <p className="text-xs text-muted-foreground">
              For the Sun: Rs ≈ 3 km. For a 10 M☉ black hole: Rs ≈ 30 km.
              For Sgr A* (4×10⁶ M☉): Rs ≈ 12 million km ≈ 0.08 AU.
            </p>
          </CardContent>
        </Card>

        {/* Key Radii */}
        <Card>
          <CardHeader>
            <CardTitle>Key Orbital Radii</CardTitle>
            <CardDescription>
              Characteristic length scales in Schwarzschild spacetime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {KEY_RADII.map((row, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40"
                  style={{ borderLeftColor: row.color, borderLeftWidth: "3px" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {row.radius}
                      </code>
                      <span className="text-sm font-semibold">{row.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{row.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Dilation + Lensing */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gravitational Time Dilation</CardTitle>
            <CardDescription>Clocks run slower in stronger gravitational fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              From the Schwarzschild metric, a stationary clock at radius r ticks
              slower than a clock at infinity:
            </p>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="\frac{d\tau}{dt} = \sqrt{1 - \frac{R_s}{r}}"
                block
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { r: "10 Rs", factor: "0.949", effect: "5.1% slower" },
                { r: "2 Rs", factor: "0.707", effect: "29.3% slower" },
                { r: "1.1 Rs", factor: "0.302", effect: "69.8% slower" },
              ].map(({ r, factor, effect }) => (
                <div key={r} className="bg-muted/50 rounded p-2">
                  <div className="font-bold">{r}</div>
                  <div className="text-muted-foreground font-mono">{factor}</div>
                  <div className="text-amber-400">{effect}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              For a circular orbit, the combined GR effect is: dτ/dt = √(1 − 3Rs/2r),
              with time freezing at the photon sphere (r = 1.5Rs).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gravitational Lensing</CardTitle>
            <CardDescription>
              Light deflection by spacetime curvature — Einstein&apos;s prediction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Light follows null geodesics — curved paths in curved spacetime.
              The deflection angle for a ray with impact parameter b is:
            </p>
            <div className="bg-muted rounded p-3 text-center space-y-2">
              <MathDisplay
                formula="\alpha \approx \frac{2R_s}{b} \quad (b \gg R_s)"
                block
              />
              <div className="text-xs text-muted-foreground">Weak-field Einstein deflection formula</div>
            </div>
            <div className="bg-muted rounded p-3 text-center space-y-2">
              <MathDisplay
                formula="b_c = \frac{3\sqrt{3}}{2}\,R_s \approx 2.598\,R_s"
                block
              />
              <div className="text-xs text-muted-foreground">
                Critical impact parameter — photons with b ≤ b_c are captured
              </div>
            </div>
            <div className="bg-muted rounded p-3 text-center space-y-2">
              <MathDisplay
                formula="\theta_E = \sqrt{\frac{R_s}{D_L}}"
                block
              />
              <div className="text-xs text-muted-foreground">Einstein ring radius (observer at D_L)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accretion Physics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accretion Disk Physics</CardTitle>
            <CardDescription>Shakura-Sunyaev thin disk model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Infalling matter forms a rotating disk. The temperature profile
              of a thin (Shakura-Sunyaev) disk peaks at the ISCO and falls off
              with radius.
            </p>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="T(r) \propto \left(\frac{\dot{M}}{r^3}\right)^{1/4}"
                block
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold text-blue-300">Stellar BH</div>
                <div className="text-muted-foreground">T_peak ~ 10⁷ K</div>
                <div>X-ray binary</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold text-orange-300">Supermassive BH</div>
                <div className="text-muted-foreground">T_peak ~ 10⁵ K</div>
                <div>AGN / Quasar</div>
              </div>
            </div>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="L_{Edd} = \frac{4\pi G M m_p c}{\sigma_T}"
                block
              />
              <div className="text-xs text-muted-foreground mt-1">Eddington luminosity — maximum stable accretion rate</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orbital Mechanics</CardTitle>
            <CardDescription>
              Particle trajectories in Schwarzschild spacetime
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The effective potential for a massive particle in Schwarzschild geometry
              includes a GR correction term that destabilizes orbits inside the ISCO:
            </p>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="V_{eff}(r) = -\frac{GM}{r} + \frac{L^2}{2r^2} - \frac{GML^2}{c^2 r^3}"
                block
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              The last term (GR correction) creates an unstable maximum at r = 3Rs,
              defining the ISCO as the innermost stable orbit.
            </div>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="v_{circ} = \sqrt{\frac{GM}{r}} \cdot \frac{1}{\sqrt{1 - R_s/r}}"
                block
              />
              <div className="text-xs text-muted-foreground mt-1">Circular orbit velocity in Schwarzschild coordinates</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hawking Radiation + Bekenstein-Hawking Entropy */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hawking Radiation</CardTitle>
            <CardDescription>Quantum thermal emission from the event horizon (Hawking 1975)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Black holes are not perfectly black. Quantum field theory in curved
              spacetime predicts that particle-antiparticle pairs created near the
              horizon allow one partner to escape — the black hole radiates as a
              perfect blackbody at the Hawking temperature.
            </p>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="T_H = \frac{\hbar c^3}{8\pi G M k_B} \approx \frac{6.17 \times 10^{-8}}{M/M_\odot} \text{ K}"
                block
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">10 M☉</div>
                <div className="text-muted-foreground font-mono">T ≈ 6×10⁻⁹ K</div>
                <div className="text-muted-foreground">Undetectable</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">10¹² kg</div>
                <div className="text-muted-foreground font-mono">T ≈ 10¹² K</div>
                <div className="text-green-400">Evaporating now</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="font-bold">Planck mass</div>
                <div className="text-muted-foreground font-mono">T ≈ T_P</div>
                <div className="text-red-400">Explosive</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bekenstein-Hawking Entropy</CardTitle>
            <CardDescription>Entropy proportional to horizon area — holographic principle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Black hole entropy is proportional to the event horizon <em>area</em>, not
              volume. This is the deepest hint of the holographic principle: information
              is encoded on a 2D surface.
            </p>
            <div className="bg-muted rounded p-3 text-center space-y-2">
              <MathDisplay
                formula="S_{BH} = \frac{k_B c^3 A}{4 G \hbar} = \frac{k_B \pi R_s^2}{\ell_P^2}"
                block
              />
              <div className="text-xs text-muted-foreground">where ℓ_P = √(Għ/c³) ≈ 1.616 × 10⁻³⁵ m (Planck length)</div>
            </div>
            <div className="bg-muted rounded p-3 text-center">
              <MathDisplay
                formula="t_{evap} = \frac{5120\pi G^2 M^3}{\hbar c^4}"
                block
              />
              <div className="text-xs text-muted-foreground mt-1">
                Evaporation timescale — for 10 M☉: ~2×10⁷⁴ years
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observed Black Hole Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-4" />
            Observed Black Hole Catalog
          </CardTitle>
          <CardDescription>
            Confirmed black holes with observationally-measured masses. All values
            from peer-reviewed literature; click any row to load in the simulator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Name</th>
                  <th className="text-left py-2 pr-3 font-medium">Type</th>
                  <th className="text-left py-2 pr-3 font-medium">Mass</th>
                  <th className="text-left py-2 pr-3 font-medium">Rs</th>
                  <th className="text-left py-2 pr-3 font-medium">Distance</th>
                  <th className="text-left py-2 font-medium">Method / Reference</th>
                </tr>
              </thead>
              <tbody>
                {CATALOG.map((bh, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/20 hover:bg-muted/20 transition-colors"
                    style={{ borderLeftColor: bh.color, borderLeftWidth: "3px" }}
                  >
                    <td className="py-2 pr-3 font-semibold" style={{ color: bh.color }}>{bh.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{bh.type}</td>
                    <td className="py-2 pr-3 font-mono">{bh.mass}</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{bh.rs}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{bh.distance}</td>
                    <td className="py-2 text-muted-foreground">{bh.method} · <em>{bh.ref}</em></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center py-6 space-y-4 border rounded-xl bg-muted/20">
        <h2 className="text-2xl font-bold">Explore the Simulation</h2>
        <p className="text-muted-foreground">
          Interactively adjust black hole mass, accretion rate, and observer distance.
          Watch particles orbit, photons bend, and time dilate.
        </p>
        <Button asChild size="lg">
          <Link href="/black-hole-simulator/simulation">
            <Orbit className="size-4 mr-2" />
            Open Simulator
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARD
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
