import { useState, useEffect, useRef } from 'react'

type CountDown = [number, () => void, () => void]

const useCountDown: (initialCount?: number) => CountDown = (
  initialCount = 60
) => {
  const [count, setCount] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (count <= 0) return
    intervalRef.current = setInterval(() => {
      setCount(count - 1)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [count])

  const startCount = () => setCount(initialCount)
  const stopCount = () => {
    setCount(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  return [count, startCount, stopCount]
}

export default useCountDown
