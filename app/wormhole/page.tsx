/**
 * @fileoverview Wormhole Visualization — Landing / Intro Page
 *
 * Introduces the scientific framework for traversable wormholes, explains
 * the underlying physics, and links to the interactive 3D simulation.
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
  Zap,
  Layers,
  Star,
  Globe,
  Timer,
  Atom,
  Telescope,
  AlertTriangle,
  Activity,
  Database,
} from "lucide-react"

// ─── Wormhole Catalog ─────────────────────────────────────────────────────────
// Theoretical wormhole models from the literature with their properties.
// Unlike black holes, no confirmed wormholes have been observed — these
// represent theoretically motivated parameter estimates.

const THEORETICAL_MODELS = [
  {
    name: "Morris–Thorne (1988)",
    type: "Traversable",
    throatRadius: "~1 AU",
    exoticMatter: "~1 M☉ negative",
    tidalForce: "Zero (Φ=0)",
    traversal: "~8 min at 0.1c",
    ref: "Morris & Thorne 1988, Am. J. Phys. 56, 395",
    color: "#00ffcc",
    note: "First detailed proposal for a human-traversable wormhole",
  },
  {
    name: "Ellis Drainhole (1973)",
    type: "Traversable",
    throatRadius: "Arbitrary b₀",
    exoticMatter: "Scalar field",
    tidalForce: "Zero",
    traversal: "Finite",
    ref: "Ellis 1973, J. Math. Phys. 14, 104",
    color: "#88ccff",
    note: "First exact traversable wormhole solution with scalar field source",
  },
  {
    name: "Einstein–Rosen Bridge (1935)",
    type: "Non-traversable",
    throatRadius: "Rs = 2GM/c²",
    exoticMatter: "None required",
    tidalForce: "Infinite at horizon",
    traversal: "Impossible (pinches off)",
    ref: "Einstein & Rosen 1935, Phys. Rev. 48, 73",
    color: "#ffaa44",
    note: "The original wormhole solution — connects two Schwarzschild geometries but cannot be traversed",
  },
  {
    name: "Thin-Shell Wormhole",
    type: "Traversable (exotic shell)",
    throatRadius: "a > Rs",
    exoticMatter: "Negative surface energy",
    tidalForce: "Finite",
    traversal: "Possible",
    ref: "Visser 1989, Phys. Rev. D 39, 3182",
    color: "#ffcc88",
    note: "Constructed by cutting and gluing two Schwarzschild spacetimes at a thin shell",
  },
  {
    name: "ER=EPR Conjecture",
    type: "Quantum (speculative)",
    throatRadius: "Planck scale",
    exoticMatter: "Quantum entanglement",
    tidalForce: "N/A",
    traversal: "Not classical",
    ref: "Maldacena & Susskind 2013, Fortschr. Phys. 61, 781",
    color: "#cc88ff",
    note: "Proposed connection between Einstein–Rosen bridges and Einstein–Podolsky–Rosen entanglement",
  },
]

// ─── Feature Cards ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Layers,
    title: "Spacetime Embedding",
    description:
      "Visualize the wormhole throat as a curved surface embedded in 3D space. The characteristic 'flared tube' geometry follows the exact Ellis embedding function.",
    color: "text-cyan-400",
  },
  {
    icon: Zap,
    title: "Light Ray Integration",
    description:
      "Null geodesics are integrated using 4th-order Runge–Kutta in the equatorial plane. Rays are color-coded by outcome: through, deflected, or orbiting.",
    color: "text-yellow-400",
  },
  {
    icon: Star,
    title: "Real Star Catalog",
    description:
      "Background star field uses real coordinates from the Hipparcos Catalogue (ESA 1997) and Yale Bright Star Catalogue, with spectral class colors.",
    color: "text-blue-400",
  },
  {
    icon: Globe,
    title: "Galaxy Lensing",
    description:
      "30 galaxies from the Messier and NGC catalogues are gravitationally lensed by the wormhole, showing magnification and position distortion.",
    color: "text-purple-400",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WormholePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">

        {/* ── Hero ── */}
        <section className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Activity className="h-9 w-9 text-cyan-400" />
            <h1 className="text-4xl font-bold tracking-tight">
              Wormhole Visualization
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Interactive 3D simulation of traversable wormholes based on the
            Morris–Thorne metric, with real astronomical datasets and gravitational
            lensing.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
              Morris–Thorne 1988
            </Badge>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
              General Relativity
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
              Hipparcos Catalogue
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400/50">
              Gravitational Lensing
            </Badge>
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/wormhole/simulation">
                Launch Simulation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Features ── */}
        <section>
          <h2 className="text-xl font-semibold mb-8">Simulation Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-border/60">
                <CardHeader className="pb-3">
                  <f.icon className={`h-5 w-5 ${f.color} mb-2`} />
                  <CardTitle className="text-sm leading-snug">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Wormhole Metric ── */}
        <section>
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <Atom className="h-5 w-5 text-cyan-400" />
            Spacetime Physics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Atom className="h-4 w-4 text-cyan-400" />
                Morris–Thorne Metric
              </CardTitle>
              <CardDescription className="text-xs">
                The spacetime metric for a zero-tidal-force traversable wormhole
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MathDisplay
                formula="ds^2 = -c^2 dt^2 + dl^2 + r(l)^2 \left( d\theta^2 + \sin^2\theta\, d\phi^2 \right)"
                block
              />
              <p className="text-sm text-muted-foreground">
                where the radial coordinate <MathDisplay formula="r(l)" /> and proper
                distance <MathDisplay formula="l \in (-\infty, +\infty)" /> are related by
                the Ellis formula:
              </p>
              <MathDisplay
                formula="r(l) = \sqrt{b_0^2 + l^2}"
                block
              />
              <p className="text-sm text-muted-foreground">
                The throat at <MathDisplay formula="l = 0" /> has radius{" "}
                <MathDisplay formula="r = b_0" /> (the minimum radial extent). Both
                sides of the wormhole are asymptotically flat as{" "}
                <MathDisplay formula="|l| \to \infty" />.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-yellow-400" />
                Photon Geodesics
              </CardTitle>
              <CardDescription className="text-xs">
                Null geodesic equation in the equatorial plane
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MathDisplay
                formula="\frac{d^2 l}{d\phi^2} = l \left[ \frac{2(b_0^2 + l^2)}{b^2} - 1 \right]"
                block
              />
              <p className="text-sm text-muted-foreground">
                where <MathDisplay formula="b = L/E" /> is the impact parameter
                (angular momentum per unit energy). The effective potential is:
              </p>
              <MathDisplay
                formula="V_\mathrm{eff}(l) = \frac{L^2}{b_0^2 + l^2}"
                block
              />
              <div className="space-y-1">
                {[
                  { cond: "b < b_0", outcome: "Passes through throat → other universe" },
                  { cond: "b = b_0", outcome: "Unstable circular orbit at throat" },
                  { cond: "b > b_0", outcome: "Deflected, returns to original region" },
                ].map((row) => (
                  <div
                    key={row.cond}
                    className="flex gap-3 text-xs items-start pl-2 border-l-2 border-muted"
                  >
                    <span className="font-mono text-cyan-400 min-w-[60px] text-xs"><MathDisplay formula={row.cond} /></span>
                    <span className="text-muted-foreground">{row.outcome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4 text-green-400" />
                Embedding Diagram
              </CardTitle>
              <CardDescription className="text-xs">
                The throat geometry embedded in flat Euclidean 3-space
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MathDisplay
                formula="\frac{dz}{dr} = \pm \frac{1}{\sqrt{r^2/b_0^2 - 1}}"
                block
              />
              <p className="text-sm text-muted-foreground">
                Integrating yields the characteristic catenoid (flared-tube) shape:
              </p>
              <MathDisplay
                formula="z(r) = \pm b_0 \cosh^{-1}\!\left(\frac{r}{b_0}\right) = \pm b_0 \ln\!\left(\frac{r}{b_0} + \sqrt{\left(\frac{r}{b_0}\right)^2 - 1}\right)"
                block
              />
              <p className="text-sm text-muted-foreground">
                This shape is identical to a <em>catenoid</em> — the minimal surface
                formed by a soap film stretched between two rings. The wormhole
                also satisfies a minimal surface condition, connecting this geometry
                to differential geometry.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Exotic Matter Requirement
              </CardTitle>
              <CardDescription className="text-xs">
                Violation of the Weak Energy Condition is required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MathDisplay
                formula="\rho(r) = -\frac{c^2}{8\pi G} \frac{b'(r)}{r^2}"
                block
              />
              <p className="text-sm text-muted-foreground">
                The Einstein field equations require an energy density that violates
                the Weak Energy Condition (WEC):
              </p>
              <MathDisplay
                formula="\rho + p_r < 0 \quad \Leftarrow \text{WEC violation}"
                block
              />
              <p className="text-sm text-muted-foreground">
                The total exotic matter required scales as:
              </p>
              <MathDisplay
                formula="M_\mathrm{exotic} \sim -\frac{c^2 b_0}{4G}"
                block
              />
              <p className="text-sm text-muted-foreground">
                For <MathDisplay formula="b_0 = 1\ \mathrm{km}" />, this is{" "}
                <MathDisplay formula="\sim -3 \times 10^{23}\ \mathrm{kg}" /> — the
                Casimir effect and quantum fields can produce local negative energy
                densities, though whether this scales to macroscopic wormholes
                remains an open question.
              </p>
            </CardContent>
          </Card>
          </div>
        </section>

        {/* ── Gravitational Lensing ── */}
        <section>
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <Telescope className="h-5 w-5 text-blue-400" />
            Gravitational Lensing
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Deflection Angle</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <MathDisplay
                  formula="\hat{\alpha}(b) = 2\int_{l_\mathrm{min}}^{\infty} \frac{dl}{r(l)\sqrt{r^2(l)/b^2 - 1}} - \pi"
                  block
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Numerically integrated for each impact parameter. Near-critical rays
                  (b → b₀⁺) are deflected by many multiples of π, producing photon rings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Einstein Ring Radius</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <MathDisplay
                  formula="\theta_E = \sqrt{\frac{b_0 \cdot D_{LS}}{D_L \cdot D_S}}"
                  block
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When a source, wormhole, and observer are perfectly aligned, the
                  source appears as a complete ring (Einstein ring) at angular
                  radius θ_E.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Image Magnification</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <MathDisplay
                  formula="\mu_\pm = \frac{u^2 + 2}{2u\sqrt{u^2+4}} \pm \frac{1}{2}"
                  block
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Two images form on either side of the wormhole. At u = β/θ_E = 0
                  (perfect alignment), magnification diverges → Einstein ring.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Traversal Physics ── */}
        <section>
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <Timer className="h-5 w-5 text-green-400" />
            Traversal Physics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Traveler Proper Time</CardTitle>
                <CardDescription className="text-xs">Experienced time for a wormhole crossing</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <MathDisplay
                  formula="\tau_\mathrm{traveler} = \frac{L_\mathrm{throat}}{\gamma v}"
                  block
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A traveler at velocity v = 0.1c crossing a 1-AU wormhole experiences
                  about 8 minutes of proper time. Relativistic time dilation compresses
                  this for faster travelers.
                </p>
                <div className="space-y-1.5 pt-1 border-t border-border/30">
                  {[
                    { v: "0.01c", t: "~83 min" },
                    { v: "0.10c", t: "~8.3 min" },
                    { v: "0.50c", t: "~1.4 min" },
                    { v: "0.99c", t: "~10.4 sec" },
                  ].map(({ v, t }) => (
                    <div key={v} className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-mono">v = {v}</span>
                      <span className="text-green-400 font-mono">{t}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Traversability Conditions</CardTitle>
                <CardDescription className="text-xs">
                  Requirements for a human-traversable wormhole (Morris & Thorne 1988)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      condition: "No event horizon",
                      detail: "Φ(l) finite everywhere → no trapped surfaces",
                      met: true,
                    },
                    {
                      condition: "Zero tidal force",
                      detail: "Φ'(l) = 0 → no spaghettification",
                      met: true,
                    },
                    {
                      condition: "Throat remains open",
                      detail: "b'(r₀) ≤ 1 → flaring-out condition",
                      met: true,
                    },
                    {
                      condition: "Finite traversal time",
                      detail: "∫dl/v < ∞ → travelers can cross in finite time",
                      met: true,
                    },
                    {
                      condition: "Negative energy",
                      detail: "ρ + p_r < 0 required → exotic matter",
                      met: null, // Problematic
                    },
                  ].map(({ condition, detail, met }) => (
                    <div key={condition} className="flex gap-2 items-start">
                      <span
                        className={`text-xs mt-0.5 ${
                          met === true
                            ? "text-green-400"
                            : met === false
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {met === true ? "✓" : met === false ? "✗" : "?"}
                      </span>
                      <div>
                        <div className="text-xs font-medium">{condition}</div>
                        <div className="text-xs text-muted-foreground">{detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Theoretical Models Catalog ── */}
        <section>
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            Theoretical Wormhole Models
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  {["Model", "Type", "Throat Radius", "Exotic Matter", "Tidal Force", "Reference"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs text-muted-foreground font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {THEORETICAL_MODELS.map((model) => (
                  <tr
                    key={model.name}
                    className="border-b border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div
                        className="font-medium text-sm"
                        style={{ color: model.color }}
                      >
                        {model.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">
                        {model.note}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {model.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{model.throatRadius}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{model.exoticMatter}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          model.tidalForce.includes("Zero")
                            ? "text-green-400 border-green-400/40"
                            : "text-red-400 border-red-400/40"
                        }`}
                      >
                        {model.tidalForce}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{model.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── NASA Data ── */}
        <section>
          <h2 className="text-xl font-semibold mb-8 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-400" />
            Astronomical Datasets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Hipparcos Catalogue",
                agency: "ESA 1997",
                desc: "50 bright stars with real equatorial coordinates (J2000.0), parallax distances, and spectral classifications. Used for the background star field.",
                count: "50 stars",
                color: "text-blue-400",
              },
              {
                title: "Yale Bright Star Catalogue",
                agency: "Hoffleit & Warren 1991",
                desc: "Supplementary stellar data including spectral classes and visual magnitudes for the brightest stars in the night sky.",
                count: "9,096 stars (subset used)",
                color: "text-yellow-400",
              },
              {
                title: "Messier / NGC Catalogue",
                agency: "NED / CDS",
                desc: "30 galaxies including M31, M87, M51 and NGC objects, with redshifts, distances from NED, and morphological types.",
                count: "30 galaxies",
                color: "text-purple-400",
              },
              {
                title: "NASA/IPAC NED",
                agency: "NASA/IPAC",
                desc: "Galaxy distances computed from the NED cosmological calculator with H₀=70, Ω_m=0.3, Ω_Λ=0.7.",
                count: "Cosmological distances",
                color: "text-green-400",
              },
              {
                title: "CDS VizieR",
                agency: "Centre de Données astronomiques de Strasbourg",
                desc: "Cross-matching and validation of catalog data, spectral classifications, and coordinate transformations.",
                count: "Reference catalog",
                color: "text-cyan-400",
              },
              {
                title: "IAU 2015 Constants",
                agency: "International Astronomical Union",
                desc: "Physical constants used in all calculations: c, G, solar mass, solar radius, AU — all from CODATA 2018 / IAU 2015 nominal values.",
                count: "Physical constants",
                color: "text-red-400",
              },
            ].map((d) => (
              <Card key={d.title} className="border-border/60">
                <CardHeader className="pb-3">
                  <Badge variant="outline" className={`${d.color} border-current/40 text-xs w-fit mb-2`}>
                    {d.agency}
                  </Badge>
                  <CardTitle className="text-sm leading-snug">{d.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                  <p className="text-xs font-mono mt-2.5 text-muted-foreground/50">{d.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center space-y-4 py-10 border-t border-border/40">
          <h2 className="text-2xl font-bold">Explore the Wormhole</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Launch the interactive 3D simulation to explore the wormhole geometry,
            adjust parameters, and trace light rays through curved spacetime.
          </p>
          <Button asChild size="lg">
            <Link href="/wormhole/simulation">
              Open 3D Simulation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

      </div>
    </main>
  )
}
