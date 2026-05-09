import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  format?: (v: number) => string
  className?: string
}

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { stiffness: 70, damping: 18, restDelta: 0.01 })
  const display = useTransform(spring, (v) => (format ? format(v) : String(Math.round(v))))
  const prevRef = useRef(0)

  useEffect(() => {
    motionValue.set(prevRef.current)
    motionValue.set(value)
    prevRef.current = value
  }, [value, motionValue])

  return <motion.span className={className}>{display}</motion.span>
}
