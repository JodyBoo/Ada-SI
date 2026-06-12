import * as THREE from 'three'

export type PortalRing = {
  radius: number
  z: number
  tube: number
  warm: boolean
}

export type PortalData = {
  rings: PortalRing[]
  rayPositions: Float32Array
  linePositions: Float32Array
  nodePositions: Float32Array
  bokehSmall: Float32Array
  bokehLarge: Float32Array
  shardPositions: THREE.Vector3[]
  shardCount: number
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export function buildPortalData(): PortalData {
  const rings: PortalRing[] = [
    { radius: 2.55, z: -0.35, tube: 0.022, warm: false },
    { radius: 2.05, z: -0.15, tube: 0.018, warm: true },
    { radius: 1.62, z: 0, tube: 0.016, warm: false },
    { radius: 1.22, z: 0.12, tube: 0.014, warm: true },
    { radius: 0.88, z: 0.22, tube: 0.012, warm: false },
    { radius: 0.58, z: 0.28, tube: 0.01, warm: true },
  ]

  const rayCount = 32
  const rayPositions: number[] = []
  for (let i = 0; i < rayCount; i += 1) {
    const angle = (i / rayCount) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    rayPositions.push(0, 0, 0.35, cos * 2.65, sin * 2.65, -0.05)
  }

  const nodeCount = 48
  const rand = seededRandom(42)
  const nodes: THREE.Vector3[] = []

  for (let i = 0; i < nodeCount; i += 1) {
    const angle = rand() * Math.PI * 2
    const radius = THREE.MathUtils.lerp(1.05, 2.35, rand())
    const z = (rand() - 0.5) * 0.55
    nodes.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z))
  }

  const linePositions: number[] = []
  const maxDist = 0.95
  const maxEdgesPerNode = 3
  const edgeCounts = new Array(nodeCount).fill(0)

  for (let i = 0; i < nodes.length; i += 1) {
    const neighbors: Array<{ j: number; dist: number }> = []
    for (let j = i + 1; j < nodes.length; j += 1) {
      const dist = nodes[i]!.distanceTo(nodes[j]!)
      if (dist < maxDist) neighbors.push({ j, dist })
    }
    neighbors.sort((a, b) => a.dist - b.dist)
    for (const { j, dist } of neighbors) {
      if (dist >= maxDist) continue
      if (edgeCounts[i]! >= maxEdgesPerNode && edgeCounts[j]! >= maxEdgesPerNode) continue
      linePositions.push(
        nodes[i]!.x, nodes[i]!.y, nodes[i]!.z,
        nodes[j]!.x, nodes[j]!.y, nodes[j]!.z,
      )
      edgeCounts[i]! += 1
      edgeCounts[j]! += 1
    }
  }

  const nodePositions = new Float32Array(nodeCount * 3)
  nodes.forEach((node, i) => {
    nodePositions[i * 3] = node.x
    nodePositions[i * 3 + 1] = node.y
    nodePositions[i * 3 + 2] = node.z
  })

  const bokehRand = seededRandom(77)
  const bokehSmall = new Float32Array(60 * 3)
  for (let i = 0; i < 60; i += 1) {
    const angle = bokehRand() * Math.PI * 2
    const radius = bokehRand() * 2.8 + 0.3
    bokehSmall[i * 3] = Math.cos(angle) * radius
    bokehSmall[i * 3 + 1] = Math.sin(angle) * radius
    bokehSmall[i * 3 + 2] = (bokehRand() - 0.5) * 1.2
  }

  const bokehLarge = new Float32Array(18 * 3)
  for (let i = 0; i < 18; i += 1) {
    const angle = bokehRand() * Math.PI * 2
    const radius = bokehRand() * 2.2 + 0.5
    bokehLarge[i * 3] = Math.cos(angle) * radius
    bokehLarge[i * 3 + 1] = Math.sin(angle) * radius
    bokehLarge[i * 3 + 2] = (bokehRand() - 0.5) * 0.8
  }

  const shardCount = 28
  const shardPositions: THREE.Vector3[] = []
  const shardRand = seededRandom(131)
  for (let i = 0; i < shardCount; i += 1) {
    shardPositions.push(
      new THREE.Vector3(
        (shardRand() - 0.5) * 4.5,
        (shardRand() - 0.5) * 3.5,
        (shardRand() - 0.5) * 1.5,
      ),
    )
  }

  return {
    rings,
    rayPositions: new Float32Array(rayPositions),
    linePositions: new Float32Array(linePositions),
    nodePositions,
    bokehSmall,
    bokehLarge,
    shardPositions,
    shardCount,
  }
}

let cached: PortalData | null = null

export function getPortalData(): PortalData {
  if (!cached) cached = buildPortalData()
  return cached
}

// Back-compat alias
export function getTunnelData(): PortalData {
  return getPortalData()
}

export type TunnelData = PortalData
