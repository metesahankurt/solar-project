"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft } from "lucide-react"
import { AU_METERS, LIGHT_YEAR_METERS, PARSEC_METERS } from "@/lib/astronomy"

// Conversion rates to meters
const UNIT_TO_METERS: Record<string, number> = {
  km: 1000,
  au: AU_METERS,
  ly: LIGHT_YEAR_METERS,
  pc: PARSEC_METERS,
}

const UNITS = [
  { value: "km", label: "Kilometers (km)" },
  { value: "au", label: "Astronomical Units (AU)" },
  { value: "ly", label: "Light Years (ly)" },
  { value: "pc", label: "Parsecs (pc)" },
]

export function UnitConverter() {
  const [value, setValue] = useState<string>("1")
  const [fromUnit, setFromUnit] = useState<string>("au")
  const [toUnit, setToUnit] = useState<string>("km")

  const result = useMemo(() => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return "---"

    const meters = numValue * UNIT_TO_METERS[fromUnit]
    const converted = meters / UNIT_TO_METERS[toUnit]

    // Format for display
    if (converted === 0) return "0"
    if (Math.abs(converted) < 0.001 || Math.abs(converted) > 10000) {
      return converted.toExponential(4)
    }
    return converted.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }, [value, fromUnit, toUnit])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Cosmic Converter</CardTitle>
        <CardDescription>Convert between astronomical distance units.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-end">
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
               <Input 
                type="number" 
                value={value} 
                onChange={(e) => setValue(e.target.value)}
                placeholder="Value"
              />
               <Select value={fromUnit} onValueChange={setFromUnit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.value.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-center pb-2">
            <ArrowRightLeft className="text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
               <div className="flex items-center px-3 border rounded-md bg-muted w-full h-9 overflow-hidden text-sm">
                 <span className="truncate">{result}</span>
               </div>
               <Select value={toUnit} onValueChange={setToUnit}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.value.toUpperCase()}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <p><strong>1 AU</strong> ≈ 150 Million km (Earth-Sun distance)</p>
            <p><strong>1 Light Year</strong> ≈ 63,241 AU (Distance light travels in one year)</p>
            <p><strong>1 Parsec</strong> ≈ 3.26 Light Years (Used in astrometry)</p>
        </div>
      </CardContent>
    </Card>
  )
}
