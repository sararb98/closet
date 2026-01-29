'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedContainer({ children, className, delay = 0 }: AnimatedContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  children: ReactNode[]
  className?: string
}

export function AnimatedList({ children, className }: AnimatedListProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div className={className}>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            layout
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

interface FadeInProps {
  children: ReactNode
  className?: string
}

export function FadeIn({ children, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  className?: string
}

export function ScaleIn({ children, className }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
