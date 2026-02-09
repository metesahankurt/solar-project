export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-black text-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-r-pink-500 border-b-transparent border-l-yellow-500 rounded-full animate-spin-reverse"></div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Initializing Solar System...</p>
      </div>
    </div>
  );
}
