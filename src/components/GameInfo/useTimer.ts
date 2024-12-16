import { useState, useEffect } from 'react'

interface UseTimerProps {
  isRunning: boolean
  shouldReset?: boolean
}

export function useTimer({ isRunning, shouldReset }: UseTimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (shouldReset) {
      setSeconds(0)
    }
  }, [shouldReset])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSeconds((s: number) => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
} 