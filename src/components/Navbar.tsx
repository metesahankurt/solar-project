"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbit, Activity, Scale, BookOpen, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const navItems = [
  { name: "Home", href: "/", icon: Orbit },
  { name: "Solar System", href: "/solar-system", icon: Activity },
  { name: "Kepler Analysis", href: "/kepler", icon: Calculator },
  { name: "Cosmic Scale", href: "/cosmic-scale", icon: Scale },
  { name: "Methods", href: "/methods", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 mr-8">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                OrbitLab
              </span>
            </Link>
            
            <div className="hidden md:block">
              <NavigationMenu>
                <NavigationMenuList>
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <NavigationMenuItem key={item.name}>
                        <Link href={item.href} legacyBehavior passHref>
                          <NavigationMenuLink
                            className={cn(
                              navigationMenuTriggerStyle(),
                              "bg-transparent cursor-pointer",
                              isActive && "bg-accent text-accent-foreground"
                            )}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          {/* Mobile menu button could go here - to be implemented with Sheet later */}
        </div>
      </div>
    </nav>
  );
}
