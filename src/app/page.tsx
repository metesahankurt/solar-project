import Link from 'next/link';
import { ArrowRight, Globe, Activity, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4 py-8">
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 pb-2">
          Explore the Cosmos
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          A web application simulating planetary orbits using basic physics and Kepler&apos;s laws.
          Experience the scale of the universe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          <Link href="/solar-system" passHref>
            <Card className="h-full bg-background/50 backdrop-blur border-border/50 hover:bg-accent/50 transition-colors duration-300">
              <CardHeader className="flex flex-col items-center space-y-4 pb-2">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Globe size={32} />
                </div>
                <CardTitle className="text-xl">3D Solar System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">Interactive 3D visualization of our solar neighborhood.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/kepler" passHref>
             <Card className="h-full bg-background/50 backdrop-blur border-border/50 hover:bg-accent/50 transition-colors duration-300">
              <CardHeader className="flex flex-col items-center space-y-4 pb-2">
                <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Activity size={32} />
                </div>
                <CardTitle className="text-xl">Kepler Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                 <CardDescription className="text-center">Analyze orbital periods and mathematical relationships.</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/cosmic-scale" passHref>
             <Card className="h-full bg-background/50 backdrop-blur border-border/50 hover:bg-accent/50 transition-colors duration-300">
              <CardHeader className="flex flex-col items-center space-y-4 pb-2">
                <div className="p-3 rounded-full bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                  <Scale size={32} />
                </div>
                <CardTitle className="text-xl">Cosmic Scale</CardTitle>
              </CardHeader>
              <CardContent>
                 <CardDescription className="text-center">Visualize the vast distances of space with real-world comparisons.</CardDescription>
              </CardContent>
            </Card>
          </Link>
          
        </div>

        <div className="pt-8">
          <Button asChild size="lg" className="rounded-full text-lg px-8 py-6">
            <Link href="/solar-system">
              Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
