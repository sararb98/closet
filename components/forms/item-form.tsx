'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { ImageUpload } from './image-upload'
import { ClothingItemWithTags, CLOTHING_TYPES, SEASONS, COLORS, NewClothingItem } from '@/types'
import { createClothingItem, updateClothingItem } from '@/lib/actions/clothing'
import { uploadImage } from '@/lib/supabase/storage'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'

interface ItemFormProps {
  item?: ClothingItemWithTags | null
  onSuccess?: () => void
}

export function ItemForm({ item, onSuccess }: ItemFormProps) {
  const isEditing = !!item
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    image_url: item?.image_url || '',
    type: item?.type || '',
    season: item?.season || [],
    color: item?.color || '',
    brand: item?.brand || '',
    purchase_price: item?.purchase_price?.toString() || '',
    notes: item?.notes || '',
    is_favorite: item?.is_favorite || false,
  })

  const handleImageChange = (url: string, file?: File) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
    if (file) {
      setImageFile(file)
    }
  }

  const handleSeasonToggle = (season: string) => {
    setFormData((prev) => ({
      ...prev,
      season: prev.season.includes(season)
        ? prev.season.filter((s) => s !== season)
        : [...prev.season, season],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type || (!formData.image_url && !imageFile)) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in the name, type, and upload an image.',
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to add items.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      let finalImageUrl = formData.image_url

      // Upload image if a new file was selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile, user.id)
        if ('error' in uploadResult) {
          throw new Error(uploadResult.error)
        }
        finalImageUrl = uploadResult.url
      }

      const itemData: Omit<NewClothingItem, 'user_id'> = {
        name: formData.name,
        description: formData.description || null,
        image_url: finalImageUrl,
        type: formData.type,
        season: formData.season,
        color: formData.color || null,
        brand: formData.brand || null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        notes: formData.notes || null,
        is_favorite: formData.is_favorite,
      }

      let result
      if (isEditing && item) {
        result = await updateClothingItem(item.id, itemData)
      } else {
        result = await createClothingItem(itemData)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: isEditing ? 'Item updated' : 'Item added',
        description: `"${formData.name}" has been ${isEditing ? 'updated' : 'added to your closet'}.`,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/closet')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <Card>
          <CardContent className="p-6">
            <Label className="text-base font-medium mb-4 block">Photo *</Label>
            <ImageUpload
              value={formData.image_url}
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Blue Oxford Shirt"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CLOTHING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Add a description..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attributes */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-medium">Attributes</h3>

            {/* Season */}
            <div className="space-y-2">
              <Label>Season</Label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((season) => (
                  <button
                    key={season.value}
                    type="button"
                    onClick={() => handleSeasonToggle(season.value)}
                    disabled={isSubmitting}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                      formData.season.includes(season.value)
                        ? 'text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                    style={
                      formData.season.includes(season.value)
                        ? { backgroundColor: season.color }
                        : undefined
                    }
                  >
                    {season.icon} {season.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        color: prev.color === color.value ? '' : color.value,
                      }))
                    }
                    disabled={isSubmitting}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      formData.color === color.value
                        ? 'border-zinc-900 dark:border-zinc-100 scale-110 ring-2 ring-offset-2 ring-zinc-900/20'
                        : 'border-zinc-200 dark:border-zinc-700 hover:scale-105'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                placeholder="e.g., Nike, Zara"
                disabled={isSubmitting}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Purchase Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, purchase_price: e.target.value }))
                  }
                  placeholder="0.00"
                  disabled={isSubmitting}
                  className="pl-7"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="favorite"
                checked={formData.is_favorite}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_favorite: checked === true }))
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="favorite" className="cursor-pointer">
                Mark as favorite
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4 pb-8">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Add Item'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
