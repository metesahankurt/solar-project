"use client"

import React, { useEffect, useRef } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathDisplayProps {
  formula: string
  block?: boolean
}

export function MathDisplay({ formula, block = false }: MathDisplayProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      katex.render(formula, containerRef.current, {
        throwOnError: false,
        displayMode: block,
      })
    }
  }, [formula, block])

  return <span ref={containerRef} />
}
