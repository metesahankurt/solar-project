import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MethodsPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Scientific Methods & Models
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Technical documentation of the physical principles, data sources, and computational models used in OrbitLab.
        </p>
      </div>

      {/* 1. Orbital Mechanics */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold border-b border-white/10 pb-2">1. Orbital Mechanics</h2>
        <Card className="bg-background/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="text-blue-400">Keplerian Orbit Approximation</CardTitle>
            <CardDescription>
              Calculating planetary motion based on idealized physics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              This simulation utilizes an approximation based on <strong>Kepler&apos;s Laws of Planetary Motion</strong>, specifically the Third Law.
              We assume a simplified model where a small body (planet) orbits a much larger central body (Sun).
              The orbital period \( T \) is calculated using:
            </p>
            <div className="bg-muted/50 p-6 rounded-lg font-mono text-center text-foreground text-lg border border-white/5 my-4">
              T = 2π &times; &radic;<span className="border-t border-foreground inline-block pt-1">( a&sup3; / GM )</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Where:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>\( T \) is the orbital period in seconds.</li>
              <li>\( a \) is the semi-major axis (average distance) in meters.</li>
              <li>\( G \) is the Gravitational Constant.</li>
              <li>\( M \) is the mass of the central body (Sun) in kg.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              In the 3D visualization, the angular position \(\theta\) at any given time \(t\) is updated by:
              <br />
              <code className="text-sm bg-black/30 px-2 py-1 rounded ml-1">\(\theta(t) = \theta_0 + (2\pi / T) \times t\)</code>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 2. Constants & Data */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold border-b border-white/10 pb-2">2. Physical Constants & Data</h2>
        <Card className="bg-background/50 backdrop-blur border-white/10">
          <CardHeader>
            <CardTitle className="text-purple-400">Fundamental Constants</CardTitle>
            <CardDescription>Values used for all calculations (SI Units).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">G</TableCell>
                  <TableCell>Gravitational Constant</TableCell>
                  <TableCell className="font-mono">6.67430 &times; 10⁻¹¹</TableCell>
                  <TableCell className="text-right font-mono">m³ kg⁻¹ s⁻²</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">M☉</TableCell>
                  <TableCell>Solar Mass</TableCell>
                  <TableCell className="font-mono">1.989 &times; 10³⁰</TableCell>
                  <TableCell className="text-right font-mono">kg</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">AU</TableCell>
                  <TableCell>Astronomical Unit</TableCell>
                  <TableCell className="font-mono">1.496 &times; 10¹¹</TableCell>
                  <TableCell className="text-right font-mono">m</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">c</TableCell>
                  <TableCell>Speed of Light</TableCell>
                  <TableCell className="font-mono">2.998 &times; 10⁸</TableCell>
                  <TableCell className="text-right font-mono">m/s</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-4 italic">
              * Planetary data (mass, radii, distances) sourced from NASA Planetary Fact Sheet.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 3. Limitations */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold border-b border-white/10 pb-2">3. Assumptions & Limitations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="bg-background/50 backdrop-blur border-white/10 border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-yellow-500">Circular Orbits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Planets are currently modeled with <strong>eccentricity = 0</strong> (perfect circles). 
                Real planetary orbits are elliptical. This simplifies the visual update loop but introduces slight positional inaccuracies compared to a true ephemeris.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 backdrop-blur border-white/10 border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-yellow-500">N-Body Physics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The simulation creates a <strong>2-body approximation</strong> for each planet (Sun + Planet). 
                Gravitational perturbations between planets (e.g., Jupiter pulling on Mars) are ignored.
              </p>
            </CardContent>
          </Card>

           <Card className="bg-background/50 backdrop-blur border-white/10 border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-orange-500">Visual Scaling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                <strong>Planet Sizes are not to scale</strong> with distances. 
                If drawn to scale, planets would be invisible at viewing distances that show the solar system. 
                Radii are exaggerated for visibility.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Future Work */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold border-b border-white/10 pb-2">4. Future Development</h2>
        <Card className="bg-background/50 backdrop-blur border-white/10">
          <CardContent className="pt-6">
             <ul className="list-disc list-inside text-muted-foreground space-y-3">
              <li>
                <span className="text-foreground font-medium">Elliptical Orbits:</span> implementing eccentricity using the full Kepler equation solver (iterative Newton-Raphson method) for true anomaly.
              </li>
              <li>
                <span className="text-foreground font-medium">N-Body Simulation:</span> Integrating a symplectic integrator (like Velocity Verlet or Runge-Kutta 4) to simulate gravitational interactions between all bodies.
              </li>
              <li>
                <span className="text-foreground font-medium">Lagrange Points:</span> Calculation and visualization of L1-L5 points.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
      
      <div className="pt-8 text-center text-sm text-muted-foreground">
        <p>Built with Next.js 16, React Three Fiber, and Tailwind CSS.</p>
      </div>
    </div>
  );
}
