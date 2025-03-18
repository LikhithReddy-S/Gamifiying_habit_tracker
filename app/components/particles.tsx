"use client"

import { useEffect, useRef } from "react"

interface ParticleProps {
  origin: { x: number; y: number }
  count?: number
  colors?: string[]
  duration?: number
  size?: { min: number; max: number }
  speed?: { min: number; max: number }
}

export default function Particles({
  origin,
  count = 20,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd"],
  duration = 1000,
  size = { min: 5, max: 15 },
  speed = { min: 50, max: 200 },
}: ParticleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to window size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create particles
    const particles: {
      x: number
      y: number
      size: number
      color: string
      vx: number
      vy: number
      life: number
      maxLife: number
    }[] = []

    for (let i = 0; i < count; i++) {
      // Random angle in radians
      const angle = Math.random() * Math.PI * 2

      // Random speed
      const s = speed.min + Math.random() * (speed.max - speed.min)

      particles.push({
        x: origin.x,
        y: origin.y,
        size: size.min + Math.random() * (size.max - size.min),
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        life: 0,
        maxLife: duration * (0.7 + Math.random() * 0.3), // Slightly randomize duration
      })
    }

    // Animation variables
    let animationFrameId: number
    let lastTime = performance.now()

    // Animation loop
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000 // Convert to seconds
      lastTime = time

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      let allDead = true

      for (const p of particles) {
        // Update life
        p.life += deltaTime * 1000

        if (p.life < p.maxLife) {
          allDead = false

          // Calculate opacity based on life
          const opacity = 1 - p.life / p.maxLife

          // Update position
          p.x += p.vx * deltaTime
          p.y += p.vy * deltaTime

          // Apply gravity
          p.vy += 98 * deltaTime // Gravity effect

          // Draw particle
          ctx.globalAlpha = opacity
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * (1 - (p.life / p.maxLife) * 0.5), 0, Math.PI * 2)
          ctx.fill()

          // Add glow effect
          ctx.globalAlpha = opacity * 0.5
          ctx.shadowColor = p.color
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 1.2 * (1 - (p.life / p.maxLife) * 0.5), 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // Continue animation if particles are still alive
      if (!allDead) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [origin, count, colors, duration, size, speed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
    />
  )
}

