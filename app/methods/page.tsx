import { MathDisplay } from "@/components/ui/math-display"

export default function MethodsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Methods and Models</h1>
        <p className="text-xl text-muted-foreground">
          This page summarizes the scientific models, constants, and assumptions used in the project
          in an academic format.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <h2 className="text-2xl font-bold">Models and Assumptions</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Light-travel time uses a constant speed of light in vacuum.</li>
            <li>Interplanetary distances use average or representative values.</li>
            <li>Plane times assume a constant commercial cruising speed.</li>
            <li>Log-scale views are used to compare orders of magnitude.</li>
            <li>Planet positions are derived from VSOP87-based ephemerides (astronomy-engine).</li>
            <li>Optional light-time correction and barycenter frames are provided for higher fidelity.</li>
          </ul>
          <div className="rounded-md bg-muted p-4 text-center overflow-x-auto">
            <MathDisplay formula="t = d / c" block />
          </div>
          <p className="text-sm text-muted-foreground">
            Light-travel time is obtained by dividing distance by the speed of light.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <h2 className="text-2xl font-bold">Constants and Units</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Speed of light: 299,792.458 km/s</li>
            <li>1 AU (Earth-Sun): 149,597,870 km</li>
            <li>1 light-year: 9.4607 x 10^12 km</li>
            <li>1 parsec: 3.0857 x 10^13 km</li>
            <li>Plane speed: 900 km/h (commercial jet average)</li>
          </ul>
          <div className="rounded-md bg-muted p-4 text-center overflow-x-auto">
            <MathDisplay formula="1\\,ly = 9.4607 \\times 10^{12}\\,km" block />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <h2 className="text-2xl font-bold">Limitations and Future Work</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Some distances are averages and do not reflect orbital variation.</li>
            <li>Plane times do not account for routing, wind, or layovers.</li>
            <li>Simulations rely on simplified model assumptions.</li>
            <li>Future work includes elliptical orbits and multi-body dynamics.</li>
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground space-y-4">
          <h2 className="text-2xl font-bold">References</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>NASA Planetary Fact Sheet</li>
            <li>ESA: Space Science data</li>
            <li>IAU: Astronomical constants</li>
            <li>CODATA 2018 physical constants</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Numerical values are based on published references from official agencies.
          </p>
        </div>
      </div>
    </div>
  )
}
