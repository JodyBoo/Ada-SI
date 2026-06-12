import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { getBokehTexture, getRuneRingTexture, getSoftGlowTexture } from './glowTexture'
import { getPortalData } from './tunnelGeometry'
import { VISUALIZER_COLORS } from './visualizerTheme'
import type { VisualizerActivity } from './useVisualizerActivity'

type TunnelSceneProps = {
  activity: VisualizerActivity
  mouse: { x: number; y: number }
  reducedMotion: boolean
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function TunnelScene({ activity, mouse, reducedMotion }: TunnelSceneProps) {
  const portal = useMemo(() => getPortalData(), [])
  const ringsRef = useRef<THREE.Group>(null)
  const runeRingRef = useRef<THREE.Mesh>(null)
  const raysRef = useRef<THREE.LineSegments>(null)
  const plexusRef = useRef<THREE.LineSegments>(null)
  const shardsRef = useRef<THREE.InstancedMesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const coreLightRef = useRef<THREE.PointLight>(null)

  const softGlow = useMemo(() => getSoftGlowTexture(), [])
  const bokehTex = useMemo(() => getBokehTexture(), [])
  const runeTex = useMemo(() => getRuneRingTexture(), [])

  const smooth = useRef({ intensity: activity.intensity, coreScale: 1 })

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const rayGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(portal.rayPositions, 3))
    return geo
  }, [portal.rayPositions])

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(portal.linePositions, 3))
    return geo
  }, [portal.linePositions])

  const nodeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(portal.nodePositions, 3))
    return geo
  }, [portal.nodePositions])

  const bokehSmallGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(portal.bokehSmall, 3))
    return geo
  }, [portal.bokehSmall])

  const bokehLargeGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(portal.bokehLarge, 3))
    return geo
  }, [portal.bokehLarge])

  useFrame((state, delta) => {
    if (reducedMotion) return

    const t = state.clock.elapsedTime
    smooth.current.intensity = lerp(smooth.current.intensity, activity.intensity, delta * 3)

    const pulse = 1 + Math.sin(t * (1.2 + smooth.current.intensity * 2.5)) * 0.1
    smooth.current.coreScale = lerp(
      smooth.current.coreScale,
      (0.85 + smooth.current.intensity * 0.55) * pulse,
      delta * 5,
    )

    const spinSpeed =
      activity.mode === 'celebrating'
        ? 0.35
        : activity.mode === 'streaming'
          ? 0.22
          : activity.mode === 'building'
            ? 0.16
            : activity.mode === 'thinking'
              ? 0.12
              : 0.05

    if (ringsRef.current) {
      ringsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        mesh.rotation.z = t * spinSpeed * (i % 2 === 0 ? 1 : -1) * (1 + i * 0.08)
        const mat = mesh.material as THREE.MeshBasicMaterial
        const highlight =
          activity.mode === 'building' && i === activity.activePhaseIndex % portal.rings.length
        mat.opacity = highlight ? 1 : 0.45 + smooth.current.intensity * 0.45
      })
    }

    if (runeRingRef.current) {
      runeRingRef.current.rotation.z = -t * spinSpeed * 0.6
      const mat = runeRingRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.35 + smooth.current.intensity * 0.45
    }

    if (raysRef.current) {
      const mat = raysRef.current.material as THREE.LineBasicMaterial
      mat.opacity = 0.12 + smooth.current.intensity * 0.35
      raysRef.current.rotation.z = t * 0.03
    }

    if (plexusRef.current) {
      const mat = plexusRef.current.material as THREE.LineBasicMaterial
      mat.opacity = 0.18 + smooth.current.intensity * 0.42
      plexusRef.current.rotation.z = t * spinSpeed * 0.25
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(smooth.current.coreScale)
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.75 + smooth.current.intensity * 0.25
    }

    if (haloRef.current) {
      const s = smooth.current.coreScale * (2.2 + Math.sin(t * 1.8) * 0.15)
      haloRef.current.scale.set(s, s, 1)
      const mat = haloRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.08 + smooth.current.intensity * 0.12
    }

    if (coreLightRef.current) {
      coreLightRef.current.intensity = 2 + smooth.current.intensity * 6
    }

    const shards = shardsRef.current
    if (shards) {
      for (let i = 0; i < portal.shardCount; i += 1) {
        const base = portal.shardPositions[i]!
        dummy.position.set(
          base.x + Math.sin(t * 0.4 + i) * 0.08,
          base.y + Math.cos(t * 0.35 + i * 0.7) * 0.08,
          base.z,
        )
        dummy.rotation.set(t * 0.15 + i, t * 0.1 + i, i)
        dummy.scale.set(0.06, 0.04, 1)
        dummy.updateMatrix()
        shards.setMatrixAt(i, dummy.matrix)
      }
      shards.instanceMatrix.needsUpdate = true
    }

    const cam = state.camera
    cam.position.x = lerp(cam.position.x, mouse.x * 0.22, delta * 3)
    cam.position.y = lerp(cam.position.y, mouse.y * 0.16, delta * 3)
    cam.lookAt(mouse.x * 0.08, mouse.y * 0.06, 0)
  })

  const bloomIntensity = reducedMotion ? 0.8 : 2.8

  return (
    <>
      <color attach="background" args={[VISUALIZER_COLORS.bg]} />
      <fog attach="fog" args={[VISUALIZER_COLORS.bg, 5, 16]} />

      <ambientLight intensity={0.08} />
      <pointLight
        ref={coreLightRef}
        position={[0, 0, 0.6]}
        color={VISUALIZER_COLORS.goldBright}
        intensity={3}
        distance={12}
      />
      <pointLight
        position={[0, 0, -1]}
        color={VISUALIZER_COLORS.teal}
        intensity={1.2}
        distance={10}
      />

      {/* Radial rays */}
      <lineSegments ref={raysRef} geometry={rayGeometry}>
        <lineBasicMaterial
          color={VISUALIZER_COLORS.goldBright}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Plexus shell — no center clutter */}
      <lineSegments ref={plexusRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color={VISUALIZER_COLORS.line}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <points geometry={nodeGeometry}>
        <pointsMaterial
          map={softGlow}
          color={VISUALIZER_COLORS.tealBright}
          size={0.14}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Bokeh layers */}
      <points geometry={bokehSmallGeo}>
        <pointsMaterial
          map={bokehTex}
          color={VISUALIZER_COLORS.particle}
          size={0.22}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <points geometry={bokehLargeGeo}>
        <pointsMaterial
          map={bokehTex}
          color={VISUALIZER_COLORS.gold}
          size={0.45}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Floating shards */}
      <instancedMesh ref={shardsRef} args={[undefined, undefined, portal.shardCount]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={VISUALIZER_COLORS.ringCool}
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Concentric glowing torus rings */}
      <group ref={ringsRef}>
        {portal.rings.map((ring, i) => (
          <mesh key={`ring-${i}`} position={[0, 0, ring.z]}>
            <torusGeometry args={[ring.radius, ring.tube, 12, 96]} />
            <meshBasicMaterial
              color={ring.warm ? VISUALIZER_COLORS.ringWarm : VISUALIZER_COLORS.tealBright}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Rune ring */}
      <mesh ref={runeRingRef} position={[0, 0, 0.18]}>
        <planeGeometry args={[5.2, 5.2]} />
        <meshBasicMaterial
          map={runeTex}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Core */}
      <mesh ref={haloRef} position={[0, 0, 0.32]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={softGlow}
          color={VISUALIZER_COLORS.goldBright}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={coreRef} position={[0, 0, 0.38]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial
          color={VISUALIZER_COLORS.core}
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.2]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial
          color={VISUALIZER_COLORS.teal}
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.05}
          luminanceSmoothing={0.65}
          intensity={bloomIntensity}
          mipmapBlur
          radius={0.75}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    </>
  )
}
