import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

const Celebration = ({ trigger }) => {
  const lastTrigger = useRef(0)

  useEffect(() => {
    if (trigger && trigger !== lastTrigger.current) {
      lastTrigger.current = trigger
      // Firecracker burst from center
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Firecrackers from center
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
        })

        // Firecrackers from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: 0, y: randomInRange(0.2, 0.8) }
        })

        // Firecrackers from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: 1, y: randomInRange(0.2, 0.8) }
        })

        // Firecrackers from top
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.2, 0.8), y: 0 }
        })
      }, 250)

      // Big burst in the center
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
          zIndex: 9999
        })
      }, 100)

      // Multiple bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
          zIndex: 9999
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#45B7D1', '#FFA07A', '#98D8C8'],
          zIndex: 9999
        })
      }, 500)

      // Final big burst
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'],
          zIndex: 9999
        })
      }, 1500)
    }
  }, [trigger])

  return null
}

export default Celebration

