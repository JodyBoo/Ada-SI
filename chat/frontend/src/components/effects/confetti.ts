type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  spin: number
  life: number
  maxLife: number
  shape: 'rect' | 'circle'
}

const COLORS = ['#5b8cff', '#3ecf8e', '#7aa2ff', '#9ef0c8', '#ffd166', '#ff6b6b']

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createParticle(originX: number, originY: number): Particle {
  const angle = randomBetween(0, Math.PI * 2)
  const speed = randomBetween(4, 14)
  return {
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - randomBetween(2, 8),
    size: randomBetween(4, 9),
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    rotation: randomBetween(0, Math.PI),
    spin: randomBetween(-0.2, 0.2),
    life: 0,
    maxLife: randomBetween(55, 95),
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }
}

export function spawnConfetti(
  canvas: HTMLCanvasElement,
  originX?: number,
  originY?: number,
): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const count = reducedMotion ? 24 : 120
  const ox = originX ?? canvas.width * 0.5
  const oy = originY ?? canvas.height * 0.35
  const particles = Array.from({ length: count }, () => createParticle(ox, oy))
  let frame = 0
  let raf = 0

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = 0

    for (const p of particles) {
      p.life += 1
      if (p.life > p.maxLife) continue
      alive += 1

      p.vy += 0.22
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.spin

      const alpha = 1 - p.life / p.maxLife
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)

      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5)
      }
      ctx.restore()
    }

    frame += 1
    if (alive > 0 && frame < 180) {
      raf = requestAnimationFrame(tick)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}
