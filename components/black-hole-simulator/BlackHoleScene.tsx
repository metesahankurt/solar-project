"use client"

/**
 * @fileoverview Black Hole 3D Scene — Main React Three Fiber Canvas
 *
 * Renders the complete black hole simulation scene including:
 * - Event horizon (black sphere with glow)
 * - Accretion disk
 * - Photon sphere ring
 * - ISCO ring
 * - Orbiting particles with trails
 * - Photon trajectory paths
 * - Background star field
 * - Camera controls
 */

import { useRef, useEffect, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, Text } from "@react-three/drei"
import * as THREE from "three"

import type {
  BlackHoleSimulationResult,
  SimulationParticle,
  PhotonTrajectory,
  SimulationState,
} from "@/types/blackHole"
import { AccretionDisk } from "./AccretionDisk"
import { ParticleOrbit, InstancedParticles } from "./ParticleOrbit"
import { PhotonPaths, PhotonSphereRing, ISCORing } from "./PhotonPaths"
import { stepAllParticles } from "@/lib/orbitalMechanics"

// ─────────────────────────────────────────────────────────────────────────────
// EVENT HORIZON
// ─────────────────────────────────────────────────────────────────────────────

function EventHorizon() {
  const outerGlowRef = useRef<THREE.Mesh>(null)
  const photonRingRef = useRef<THREE.Mesh>(null)
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta

    if (outerGlowRef.current) {
      const mat = outerGlowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.07 + 0.025 * Math.sin(time.current * 0.6)
    }

    if (photonRingRef.current) {
      const mat = photonRingRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.55 + 0.1 * Math.sin(time.current * 1.2)
    }
  })

  return (
    <group>
      {/* Absolute darkness — event horizon */}
      <mesh>
        <sphereGeometry args={[1.0, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Dark absorbing shell — gravitational shadow region (r < ~2.6Rs) */}
      <mesh>
        <sphereGeometry args={[1.08, 48, 48]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.9}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Photon ring — thin bright ring at ~1.5Rs where light orbits */}
      <mesh ref={photonRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.44, 1.60, 256, 1]} />
        <meshBasicMaterial
          color="#ff8822"
          side={THREE.DoubleSide}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Lensing glow ring — diffuse light bent around the shadow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.25, 1.85, 128, 1]} />
        <meshBasicMaterial
          color="#ff6600"
          side={THREE.DoubleSide}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glow — hot corona just outside the shadow */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial
          color="#110800"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE LABELS
// ─────────────────────────────────────────────────────────────────────────────

interface SceneLabelsProps {
  showISCO: boolean
  showPhotonSphere: boolean
}

function SceneLabels({ showISCO, showPhotonSphere }: SceneLabelsProps) {
  return (
    <group>
      {showPhotonSphere && (
        <Text
          position={[1.5 + 0.5, 0.3, 0]}
          fontSize={0.25}
          color="#ffaa00"
          anchorX="left"
          anchorY="middle"
        >
          Photon Sphere (1.5 Rs)
        </Text>
      )}
      {showISCO && (
        <Text
          position={[3.0 + 0.5, -0.3, 0]}
          fontSize={0.25}
          color="#44ff88"
          anchorX="left"
          anchorY="middle"
        >
          ISCO (3 Rs)
        </Text>
      )}
      <Text
        position={[1.0 + 0.3, 0.8, 0]}
        fontSize={0.22}
        color="#888888"
        anchorX="left"
        anchorY="middle"
      >
        Event Horizon
      </Text>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION UPDATER
// ─────────────────────────────────────────────────────────────────────────────

interface SimulationUpdaterProps {
  particles: SimulationParticle[]
  onParticlesUpdate: (updated: SimulationParticle[]) => void
  rsM: number
  simulationSpeed: number
  isRunning: boolean
}

function SimulationUpdater({
  particles,
  onParticlesUpdate,
  rsM,
  simulationSpeed,
  isRunning,
}: SimulationUpdaterProps) {
  useFrame((_, delta) => {
    if (!isRunning || particles.length === 0) return
    const updated = stepAllParticles(particles, delta, rsM, simulationSpeed)
    onParticlesUpdate(updated)
  })

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D SCENE CONTENT
// ─────────────────────────────────────────────────────────────────────────────

interface BlackHoleSceneContentProps {
  simState: SimulationState
  result: BlackHoleSimulationResult
  particles: SimulationParticle[]
  photonPaths: PhotonTrajectory[]
  onParticlesUpdate: (p: SimulationParticle[]) => void
}

function BlackHoleSceneContent({
  simState,
  result,
  particles,
  photonPaths,
  onParticlesUpdate,
}: BlackHoleSceneContentProps) {
  const { geometry, accretionDisk } = result
  const rsM = geometry.schwarzschildRadiusM

  return (
    <>
      <ambientLight intensity={0.02} />

      {/* Disk illumination — warm orange glow on particles near the black hole */}
      {accretionDisk && (
        <pointLight
          position={[0, 0.5, 3]}
          intensity={1.2}
          color={accretionDisk.peakEmissionColor}
          distance={50}
          decay={2}
        />
      )}

      {/* Event horizon */}
      <EventHorizon />

      {/* Photon sphere ring */}
      <PhotonSphereRing
        radiusInRs={1.5}
        visible={simState.showPhotonSphere}
      />

      {/* ISCO ring */}
      <ISCORing radiusInRs={3.0} visible={simState.showISCO} />

      {/* Accretion disk */}
      {accretionDisk && simState.layers.accretionDisk && (
        <AccretionDisk
          disk={accretionDisk}
          schwarzschildRadiusM={rsM}
          simulationSpeed={simState.params.simulationSpeed}
        />
      )}

      {/* Photon paths */}
      <PhotonPaths
        trajectories={photonPaths}
        visible={simState.layers.photonPaths}
      />

      {/* Orbiting particles */}
      {simState.layers.particles && particles.length > 0 && (
        particles.length > 100
          ? <InstancedParticles particles={particles} />
          : <ParticleOrbit particles={particles} showTrails={simState.showTrails} />
      )}

      {/* Labels */}
      {simState.layers.labels && (
        <SceneLabels
          showISCO={simState.showISCO}
          showPhotonSphere={simState.showPhotonSphere}
        />
      )}

      {/* Physics simulation step */}
      <SimulationUpdater
        particles={particles}
        onParticlesUpdate={onParticlesUpdate}
        rsM={rsM}
        simulationSpeed={simState.params.simulationSpeed}
        isRunning={simState.isRunning}
      />

      {/* Background stars */}
      <Stars radius={300} depth={100} count={6000} factor={4} saturation={0.3} fade />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORTED CANVAS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface BlackHoleSceneProps {
  simState: SimulationState
  result: BlackHoleSimulationResult
  particles: SimulationParticle[]
  photonPaths: PhotonTrajectory[]
  onParticlesUpdate: (p: SimulationParticle[]) => void
}

export function BlackHoleScene({
  simState,
  result,
  particles,
  photonPaths,
  onParticlesUpdate,
}: BlackHoleSceneProps) {
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 8, 25], fov: 50, near: 0.1, far: 2000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <BlackHoleSceneContent
          simState={simState}
          result={result}
          particles={particles}
          photonPaths={photonPaths}
          onParticlesUpdate={onParticlesUpdate}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={2}
          maxDistance={200}
          autoRotate={false}
          makeDefault
        />
      </Canvas>

      {/* Scene overlay HUD */}
      <div className="absolute bottom-3 left-3 text-xs text-white/40 pointer-events-none font-mono">
        <div>Event Horizon = 1.0 Rs</div>
        <div>Photon Sphere = 1.5 Rs</div>
        <div>ISCO = 3.0 Rs</div>
      </div>
    </div>
  )
}
