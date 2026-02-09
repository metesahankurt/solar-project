import { KeplerCalculator } from "@/components/analysis/kepler-calculator";
import { MathDisplay } from "@/components/ui/math-display";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Kepler Analysis</h1>
        <p className="text-xl text-muted-foreground">
          Explore the relationship between a planet&apos;s distance from its star and its orbital period.
        </p>
      </div>

      <KeplerCalculator />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-bold mb-4">How it Works</h2>
          <p className="mb-4">
            Johannes Kepler discovered that the square of a planet&apos;s orbital period ($T$) is directly proportional to the cube of the semi-major axis ($r$) of its orbit.
          </p>
          <div className="bg-muted p-4 rounded-md text-center my-4 overflow-x-auto">
            <MathDisplay formula="T^2 \propto r^3" block />
          </div>
          <p>
            When using units of <strong>Earth Years</strong> for time and <strong>Astronomical Units (AU)</strong> for distance, and assuming a central body with <strong>1 Solar Mass</strong>, the equation simplifies to:
          </p>
          <div className="bg-muted p-4 rounded-md text-center my-4 overflow-x-auto">
            <MathDisplay formula="T = \sqrt{r^3}" block />
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-bold mb-4">Did You Know?</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
             <li><strong>Mercury</strong> orbits the Sun in just 88 days because it&apos;s so close (0.39 AU).</li>
             <li><strong>Neptune</strong> takes about 165 years to complete one orbit (30.07 AU).</li>
             <li>This law applies to any orbiting body, including moons orbiting planets and artificial satellites orbiting Earth.</li>
             <li>If the central star were more massive, planets would need to orbit faster to stay in stable orbit!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
