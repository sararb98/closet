'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MAX_FILE_SIZE } from '@/lib/constants'

interface ImageUploadProps {
  value?: string
  onChange: (url: string, file?: File) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB')
      return
    }

    setIsLoading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string
      setPreview(previewUrl)
      onChange(previewUrl, file)
      setIsLoading(false)
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [onChange])

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isLoading}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800"
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'relative aspect-square rounded-xl border-2 border-dashed transition-colors cursor-pointer',
              isDragging
                ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && inputRef.current?.click()}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              {isLoading ? (
                <Loader2 className="h-10 w-10 text-zinc-400 animate-spin" />
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    {isDragging ? (
                      <Upload className="h-8 w-8 text-zinc-500" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {isDragging ? 'Drop image here' : 'Click to upload'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    or drag and drop
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
