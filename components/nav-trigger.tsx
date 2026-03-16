"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavTrigger() {
  const pathname = usePathname()

  // Fullscreen 3D pages: NavTrigger must be absolutely positioned
  // so it consumes zero layout height and the canvas fills 100vh
  const isFullscreen =
    pathname === "/" ||
    pathname === "/black-hole-simulator/simulation" ||
    pathname === "/stellar-evolution/visualization" ||
    pathname === "/wormhole/simulation" ||
    pathname === "/gravitational-wave/simulation"

  return (
    <div
      className={cn(
        "z-50",
        isFullscreen
          ? "absolute top-4 left-4 text-white"
          : "w-full p-4 flex items-center bg-background text-foreground"
      )}
    >
      <SidebarTrigger />
    </div>
  )
}
