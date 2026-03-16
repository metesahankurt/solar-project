"use client"

import { useRef, useMemo, useEffect, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { ScreenQuad, useTexture } from "@react-three/drei"

import {
  BlackHoleUniforms,
  BlackHoleVertexShader,
  BlackHoleFragmentShader
} from "./BlackHoleMaterial"

function RaytracerMesh({ params }: { params: any }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  // Load background texture
  const bgTexture = useTexture("/eso0932a.jpg")

  // Track resolution
  const resolution = useMemo(() => new THREE.Vector2(), [])

  const uniformsRef = useRef(THREE.UniformsUtils.clone(BlackHoleUniforms))

  useEffect(() => {
    resolution.set(size.width * window.devicePixelRatio, size.height * window.devicePixelRatio)
    uniformsRef.current.uResolution.value = resolution

    // Assign texture
    bgTexture.wrapS = THREE.RepeatWrapping
    bgTexture.wrapT = THREE.ClampToEdgeWrapping
    bgTexture.colorSpace = THREE.SRGBColorSpace
    uniformsRef.current.uBackground.value = bgTexture
  }, [size, resolution, bgTexture])

  useFrame((state) => {
    const uniforms = uniformsRef.current
    uniforms.uTime.value = state.clock.getElapsedTime()
    uniforms.uMass.value = params.mass
    uniforms.uDiskTemp.value = params.diskTemp
    uniforms.uDiskDensity.value = params.diskDensity
    uniforms.uLensingStrength.value = params.lensingStrength
    uniforms.uPerspective.value = params.perspective
    uniforms.uQuality.value = params.quality
  })

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={BlackHoleVertexShader}
        fragmentShader={BlackHoleFragmentShader}
        uniforms={uniformsRef.current}
      />
    </ScreenQuad>
  )
}

export function RaytracerScene({ params }: { params: any }) {
  return (
    <div className="absolute inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ antialias: false, preserveDrawingBuffer: true }}
        dpr={[1, 2]} // Support high-DPI screens up to 2x
      >
        <Suspense fallback={null}>
          <RaytracerMesh params={params} />
        </Suspense>
      </Canvas>
    </div>
  )
}
