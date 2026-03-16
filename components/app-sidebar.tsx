"use client"

import { Calculator, Globe, Ruler, BookOpen, Settings, Star, Telescope, Circle, Orbit, Activity, Aperture, Waves } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Simulation",
    url: "/",
    icon: Globe,
  },
  {
    title: "Kepler Analysis",
    url: "/analysis",
    icon: Calculator,
  },
  {
    title: "Cosmic Distances",
    url: "/distance",
    icon: Ruler,
  },
  {
    title: "Methods & Models",
    url: "/methods",
    icon: BookOpen,
  },
  {
    title: "Stellar Evolution",
    url: "/stellar-evolution",
    icon: Star,
  },
  {
    title: "Star Visualization",
    url: "/stellar-evolution/visualization",
    icon: Telescope,
  },
  {
    title: "Black Hole Simulator",
    url: "/black-hole-simulator",
    icon: Circle,
  },
  {
    title: "Gravitational Waves",
    url: "/gravitational-wave",
    icon: Waves,
  },
  {
    title: "GW 3D",
    url: "/gravitational-wave/simulation",
    icon: Waves,
  },
  {
    title: "Black Hole 3D",
    url: "/black-hole-simulator/simulation",
    icon: Orbit,
  },
  {
    title: "Black Hole Raytracer",
    url: "/blackhole-raytracer",
    icon: Aperture,
  },
  {
    title: "Wormhole Explorer",
    url: "/wormhole",
    icon: Activity,
  },
  {
    title: "Wormhole 3D",
    url: "/wormhole/simulation",
    icon: Activity,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-center py-2">
          <Globe className="size-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
