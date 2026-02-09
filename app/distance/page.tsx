import { UnitConverter } from "@/components/distance/unit-converter";
import { DistanceScale } from "@/components/distance/distance-scale";
import { DistanceSets } from "@/components/distance/distance-sets";

export default function DistancePage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Cosmic Distances</h1>
        <p className="text-xl text-muted-foreground">
          Understanding the vast scales of the universe.
        </p>
      </div>

      <DistanceSets />

      <div className="grid gap-6 lg:grid-cols-2">
        <UnitConverter />
        <DistanceScale />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-bold mb-4">What is a Light Year?</h2>
          <p className="mb-3">
            A <strong>light year</strong> is the distance that light travels in one year in a vacuum. 
            Since light moves at approximately 299,792 km/s, one light year equals about 9.46 trillion kilometers.
          </p>
          <p className="text-muted-foreground text-sm">
            It&apos;s important to note that a light year is a unit of <em>distance</em>, not time!
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-card text-card-foreground">
          <h2 className="text-2xl font-bold mb-4">What is a Parsec?</h2>
          <p className="mb-3">
            A <strong>parsec</strong> (parallax second) is a unit used in astronomy, equal to about 3.26 light years or 31 trillion kilometers.
          </p>
          <p className="text-muted-foreground text-sm">
            It&apos;s derived from the method of measuring stellar distances using parallax. The nearest star, Proxima Centauri, is about 1.3 parsecs away.
          </p>
        </div>
      </div>
    </div>
  )
}
