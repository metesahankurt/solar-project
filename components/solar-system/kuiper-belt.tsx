"use client"

import React, { useMemo } from "react"
import * as THREE from "three"
import { useSimulation } from "./simulation-context"
import { mapAuToScene } from "./space-scale"
import kuiperData from "@/data/kuiper_mpc.json"

type KuiperData = {
  belt: Array<{ pos: number[]; a: number; e: number; i: number }>
  scattered: Array<{ pos: number[]; a: number; e: number; i: number }>
  detached: Array<{ pos: number[]; a: number; e: number; i: number }>
}

type KuiperItem = { pos: number[]; a: number; e: number; i: number }

function buildGeometry(items: KuiperItem[]) {
  const positions = new Float32Array(items.length * 3)
  const colors = new Float32Array(items.length * 3)
  items.forEach((item, index) => {
    const [x = 0, y = 0, z = 0] = item.pos
    positions[index * 3] = mapAuToScene(x)
    positions[index * 3 + 1] = mapAuToScene(y)
    positions[index * 3 + 2] = mapAuToScene(z)
    // Color based on inclination (low-i -> cooler, high-i -> warmer)
    const t = Math.min(1, Math.max(0, item.i / 30))
    colors[index * 3] = 0.6 + t * 0.4
    colors[index * 3 + 1] = 0.75 - t * 0.25
    colors[index * 3 + 2] = 1.0 - t * 0.3
  })
  const buffer = new THREE.BufferGeometry()
  buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  return buffer
}

export function KuiperBelt() {
  const { viewDistanceAu, performanceMode, showOrbits } = useSimulation()
  const fade = Math.min(1, Math.max(0, (viewDistanceAu - 20) / 30))

  const { classical, plutinos, twotinos, scattered, detached } = useMemo(() => {
    if (viewDistanceAu < 20) {
      return {
        classical: new THREE.BufferGeometry(),
        plutinos: new THREE.BufferGeometry(),
        twotinos: new THREE.BufferGeometry(),
        scattered: new THREE.BufferGeometry(),
        detached: new THREE.BufferGeometry(),
      }
    }
    const data = kuiperData as KuiperData
    const belt = data.belt
    const plutinoItems = belt.filter((item) => Math.abs(item.a - 39.4) < 1.0)
    const twotinoItems = belt.filter((item) => Math.abs(item.a - 47.7) < 1.2)
    const classicalItems = belt.filter(
      (item) =>
        Math.abs(item.a - 39.4) >= 1.0 &&
        Math.abs(item.a - 47.7) >= 1.2
    )
    return {
      classical: buildGeometry(classicalItems),
      plutinos: buildGeometry(plutinoItems),
      twotinos: buildGeometry(twotinoItems),
      scattered: buildGeometry(data.scattered),
      detached: buildGeometry(data.detached),
    }
  }, [viewDistanceAu, performanceMode])

  if (viewDistanceAu < 20) return null

  return (
    <group>
      <points geometry={classical}>
        <pointsMaterial
          vertexColors
          size={0.6}
          opacity={0.45 + fade * 0.35}
          transparent
        />
      </points>
      <points geometry={plutinos}>
        <pointsMaterial
          vertexColors
          size={0.65}
          opacity={0.55 + fade * 0.35}
          transparent
        />
      </points>
      <points geometry={twotinos}>
        <pointsMaterial
          vertexColors
          size={0.65}
          opacity={0.5 + fade * 0.3}
          transparent
        />
      </points>
      <points geometry={scattered}>
        <pointsMaterial
          vertexColors
          size={0.55}
          opacity={0.3 + fade * 0.25}
          transparent
        />
      </points>
      <points geometry={detached}>
        <pointsMaterial
          vertexColors
          size={0.5}
          opacity={0.18 + fade * 0.2}
          transparent
        />
      </points>
      {showOrbits && (
        <group>
          <mesh>
            <ringGeometry args={[mapAuToScene(39.4), mapAuToScene(39.6), 128]} />
            <meshBasicMaterial color="#cbd5f5" opacity={0.25} transparent side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[mapAuToScene(47.6), mapAuToScene(47.8), 128]} />
            <meshBasicMaterial color="#bfdbfe" opacity={0.22} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  )
}
