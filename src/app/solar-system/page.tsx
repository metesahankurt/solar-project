import Scene from "@/components/Scene";

export default function SolarSystemPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        3D Solar System
      </h1>
      <p className="text-muted-foreground mb-8">
        Interactive 3D visualization. Not to scale (sizes exaggerated for visibility).
      </p>
      
      <div className="w-full max-w-7xl">
        <Scene />
      </div>
    </div>
  );
}
