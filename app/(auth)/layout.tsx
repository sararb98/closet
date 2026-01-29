'use client'

import { motion } from 'motion/react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Virtual Closet
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Organize your wardrobe, plan your outfits
            </p>
          </motion.div>
        </div>
        {children}
      </motion.div>
    </div>
  )
}
