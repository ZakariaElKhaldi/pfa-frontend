import type { ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router'
import { pageVariants } from '@/lib/motion'

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
