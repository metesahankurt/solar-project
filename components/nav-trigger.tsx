"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function NavTrigger() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <div 
      className={cn(
        "z-50",
        isHome 
          ? "absolute top-4 left-4 text-white" 
          : "w-full p-4 flex items-center bg-background text-foreground"
      )}
    >
      <SidebarTrigger />
    </div>
  )
}
