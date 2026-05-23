import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Static gradient fallback when WebGL is unavailable or motion is reduced */
export function LandingHeroFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_40%)]" />
    </div>
  )
}

export function LandingHeroScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [useFallback, setUseFallback] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion() || !mountRef.current) {
      setUseFallback(true)
      return
    }

    let disposed = false
    let raf = 0
    let renderer: import('three').WebGLRenderer | null = null
    let observer: IntersectionObserver | null = null
    let visible = true

    const mount = mountRef.current

    void (async () => {
      try {
        const THREE = await import('three')

        if (disposed || !mount) return

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
        camera.position.z = 6

        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setClearColor(0x000000, 0)
        mount.appendChild(renderer.domElement)

        const group = new THREE.Group()
        scene.add(group)

        const coreGeo = new THREE.IcosahedronGeometry(1.15, 1)
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0x22d3ee,
          emissive: 0x0e7490,
          emissiveIntensity: 0.35,
          metalness: 0.6,
          roughness: 0.25,
          wireframe: true,
        })
        const core = new THREE.Mesh(coreGeo, coreMat)
        group.add(core)

        const ringGeo = new THREE.TorusGeometry(2.1, 0.03, 12, 80)
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.85 })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = Math.PI / 2.4
        group.add(ring)

        const ring2 = new THREE.Mesh(ringGeo, ringMat.clone())
        ring2.scale.set(0.72, 0.72, 0.72)
        ring2.rotation.x = Math.PI / 3.2
        ring2.rotation.y = 0.6
        group.add(ring2)

        const particles = 120
        const positions = new Float32Array(particles * 3)
        for (let i = 0; i < particles; i++) {
          const r = 2.5 + Math.random() * 2
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
          positions[i * 3 + 2] = r * Math.cos(phi)
        }
        const particleGeo = new THREE.BufferGeometry()
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const particleMat = new THREE.PointsMaterial({
          color: 0x3b82f6,
          size: 0.04,
          transparent: true,
          opacity: 0.75,
          sizeAttenuation: true,
        })
        const points = new THREE.Points(particleGeo, particleMat)
        group.add(points)

        scene.add(new THREE.AmbientLight(0xffffff, 0.45))
        const key = new THREE.DirectionalLight(0x22d3ee, 1.1)
        key.position.set(4, 4, 6)
        scene.add(key)
        const fill = new THREE.DirectionalLight(0x8b5cf6, 0.5)
        fill.position.set(-3, -2, 4)
        scene.add(fill)

        const resize = () => {
          if (!mount || !renderer) return
          const w = mount.clientWidth
          const h = mount.clientHeight
          if (w === 0 || h === 0) return
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h, false)
        }

        resize()
        const ro = new ResizeObserver(() => resize())
        ro.observe(mount)

        observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting
          },
          { threshold: 0.05 }
        )
        observer.observe(mount)

        const clock = new THREE.Clock()
        const animate = () => {
          if (disposed) return
          raf = requestAnimationFrame(animate)
          if (!visible) return
          const t = clock.getElapsedTime()
          core.rotation.y = t * 0.35
          core.rotation.x = t * 0.12
          ring.rotation.z = t * 0.25
          ring2.rotation.z = -t * 0.18
          group.rotation.y = t * 0.08
          renderer!.render(scene, camera)
        }
        animate()

        const cleanup = () => {
          ro.disconnect()
          coreGeo.dispose()
          coreMat.dispose()
          ringGeo.dispose()
          ringMat.dispose()
          ring2.material.dispose()
          particleGeo.dispose()
          particleMat.dispose()
        }
        ;(mount as HTMLDivElement & { __threeCleanup?: () => void }).__threeCleanup = cleanup
      } catch {
        if (!disposed) setUseFallback(true)
      }
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer?.disconnect()
      const el = mount as HTMLDivElement & { __threeCleanup?: () => void }
      el.__threeCleanup?.()
      if (renderer) {
        renderer.dispose()
        renderer.domElement.remove()
      }
      while (mount.firstChild) mount.removeChild(mount.firstChild)
    }
  }, [])

  if (useFallback) {
    return <LandingHeroFallback className={className} />
  }

  return (
    <div
      ref={mountRef}
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyber-950/30 via-cyber-950/60 to-cyber-950 z-[1]" />
    </div>
  )
}
