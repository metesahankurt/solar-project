"use client"

import { useMemo, useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { OrbitControls, useTexture } from "@react-three/drei"
import type { RaytracerParams } from "./RaytracerControls"

import { 
  BlackHoleUniforms, 
  BlackHoleVertexShader, 
  BlackHoleFragmentShader 
} from "./BlackHoleMaterial"

function RaytracerMesh({
  params,
  onViewChange,
}: {
  params: RaytracerParams
  onViewChange?: (view: { distance: number; visibility: number }) => void
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const lastViewRef = useRef<{ distance: number; visibility: number } | null>(null)
  // Load background texture natively in React Three Fiber
  const bgTexture = useTexture("/eso0932a.jpg")
  const configuredBgTexture = useMemo(() => {
    const texture = bgTexture.clone()
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true
    return texture
  }, [bgTexture])

  const uniforms = useMemo(() => {
    const nextUniforms = THREE.UniformsUtils.clone(BlackHoleUniforms)
    nextUniforms.uBackground.value = configuredBgTexture
    return nextUniforms
  }, [configuredBgTexture])

  useFrame((state) => {
    const nextUniforms = materialRef.current?.uniforms
    if (!nextUniforms) return
    const distance = state.camera.position.length()
    const visibility = THREE.MathUtils.smoothstep(14.5, 8.2, distance)
    nextUniforms.uTime.value = state.clock.getElapsedTime()
    nextUniforms.uMass.value = params.mass
    nextUniforms.uSpin.value = params.spin
    nextUniforms.uDiskTemp.value = params.diskTemp
    nextUniforms.uDiskDensity.value = params.diskDensity
    nextUniforms.uLensingStrength.value = params.lensingStrength
    nextUniforms.uQuality.value = params.quality
    nextUniforms.uVisibility.value = visibility

    if (onViewChange) {
      const lastView = lastViewRef.current
      if (!lastView || Math.abs(lastView.distance - distance) > 0.08 || Math.abs(lastView.visibility - visibility) > 0.02) {
        lastViewRef.current = { distance, visibility }
        onViewChange({ distance, visibility })
      }
    }
  })

  return (
    <mesh>
      {/* Huge bounding sphere */}
      <sphereGeometry args={[100, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        side={THREE.BackSide} // Render on the inside of the sphere bounds
        vertexShader={BlackHoleVertexShader}
        fragmentShader={BlackHoleFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export function RaytracerScene({
  params,
  onViewChange,
}: {
  params: RaytracerParams
  onViewChange?: (view: { distance: number; visibility: number }) => void
}) {
  return (
    <div className="absolute inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 0.34, 9.8], fov: 38 }}
        gl={{ antialias: false, preserveDrawingBuffer: true }}
        // Lower dpr automatically dynamically based on quality for massive performance
        dpr={params.quality < 2 ? [0.5, 1] : [1, 2]}
      >
        <Suspense fallback={null}>
          <OrbitControls
            makeDefault
            enablePan={false}
            target={[0, 0, 0]}
            maxDistance={22}
            minDistance={3.4}
            maxPolarAngle={Math.PI * 0.56}
            minPolarAngle={Math.PI * 0.44}
          />
          <RaytracerMesh params={params} onViewChange={onViewChange} />
        </Suspense>
      </Canvas>
    </div>
  )
}
