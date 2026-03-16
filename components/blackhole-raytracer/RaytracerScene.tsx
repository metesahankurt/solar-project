"use client"

import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { OrbitControls, useTexture } from "@react-three/drei"

import { 
  BlackHoleUniforms, 
  BlackHoleVertexShader, 
  BlackHoleFragmentShader 
} from "./BlackHoleMaterial"

function RaytracerMesh({ params }: { params: any }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  // Load background texture natively in React Three Fiber
  const bgTexture = useTexture("/eso0932a.jpg")
  bgTexture.wrapS = THREE.RepeatWrapping
  bgTexture.wrapT = THREE.ClampToEdgeWrapping
  bgTexture.colorSpace = THREE.SRGBColorSpace

  const uniformsRef = useRef(THREE.UniformsUtils.clone(BlackHoleUniforms))
  uniformsRef.current.uBackground.value = bgTexture

  useFrame((state) => {
    const uniforms = uniformsRef.current
    uniforms.uTime.value = state.clock.getElapsedTime()
    uniforms.uMass.value = params.mass
    uniforms.uDiskTemp.value = params.diskTemp
    uniforms.uDiskDensity.value = params.diskDensity
    uniforms.uLensingStrength.value = params.lensingStrength
    uniforms.uQuality.value = params.quality
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
        uniforms={uniformsRef.current}
      />
    </mesh>
  )
}

export function RaytracerScene({ params }: { params: any }) {
  return (
    <div className="absolute inset-0 bg-black">
      <Canvas
        camera={{ position: [0, 0.1, 8], fov: 75 }}
        gl={{ antialias: false, preserveDrawingBuffer: true }}
        // Lower dpr automatically dynamically based on quality for massive performance
        dpr={params.quality < 2 ? [0.5, 1] : [1, 2]}
      >
        <Suspense fallback={null}>
          <OrbitControls makeDefault enablePan={false} maxDistance={20} minDistance={2} />
          <RaytracerMesh params={params} />
        </Suspense>
      </Canvas>
    </div>
  )
}
