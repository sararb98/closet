/**
 * Upload shoe photos to Supabase Storage and update image_url in clothing_items.
 *
 * Usage:
 *   node scripts/upload-shoe-photos.mjs "C:\Users\robledos\Pictures\shoes"
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, extname, basename } from 'path'

const SUPABASE_URL = 'https://jprphldcbppzthfrubbr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcnBobGRjYnBwenRoZnJ1YmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUzMDY0NCwiZXhwIjoyMDg1MTA2NjQ0fQ.Zg1ePSE7rUIdEIW_NqXKSLBb4EQNly3B0Fn5TFeV9D4'
const STORAGE_BUCKET = 'clothing-images'
const USER_ID = '70dca3fe-3e89-4f88-9a86-73336821b5d1'

// Map exact filename (without extension) → DB item name
// Based on WhatsApp timestamp order matching catalog order #1-20
const NAME_MAP = {
  'WhatsApp Image 2026-05-11 at 15.56.09':       'Red Croc-Embossed Ballet Flats',
  'WhatsApp Image 2026-05-11 at 15.56.10':       'Metallic Gray Ballet Flats with Bow',
  'WhatsApp Image 2026-05-11 at 15.56.12':       'Black Suede Tassel Loafers',
  'WhatsApp Image 2026-05-11 at 15.56.12 (1)':   'Brown Leather Gladiator Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.12 (2)':   'White Leather Avarcas',
  'WhatsApp Image 2026-05-11 at 15.56.12 (3)':   'Pink Suede Bow Slides',
  'WhatsApp Image 2026-05-11 at 15.56.13':       'Black Braided Strap Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.14':       'Orange Striped Avarcas',
  'WhatsApp Image 2026-05-11 at 15.56.14 (1)':   'Silver Glitter Avarcas',
  'WhatsApp Image 2026-05-11 at 15.56.15':       'Bronze Buckle Slide Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.15 (1)':   'Black Lace Espadrilles',
  'WhatsApp Image 2026-05-11 at 15.56.15 (2)':   'Black Chunky Sport Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.16':       'Black & White Sport Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.16 (1)':   'Dark Gray Suede Ankle Boots',
  'WhatsApp Image 2026-05-11 at 15.56.16 (2)':   'Black Leather Mid-Calf Boots',
  'WhatsApp Image 2026-05-11 at 15.56.16 (3)':   'Silver Platform Strappy Heels',
  'WhatsApp Image 2026-05-11 at 15.56.16 (4)':   'Silver Rhinestone Flat Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.17':       'White Air Force 1 Sneakers',
  'WhatsApp Image 2026-05-11 at 15.56.17 (1)':   'Gray & Red Trail Running Shoes',
  'WhatsApp Image 2026-05-11 at 15.56.17 (2)':   'Black Suede Derby Shoes',
  // Extra items (files 21-28 in alphabetical sort)
  'WhatsApp Image 2026-05-11 at 15.56.17 (3)':   'Columbia Gray & Red Hiking Boots',
  'WhatsApp Image 2026-05-11 at 15.56.18 (1)':   'Brown Suede Cowboy Boots',
  'WhatsApp Image 2026-05-11 at 15.56.18 (2)':   'Brown Crochet Double-Strap Sandals',
  'WhatsApp Image 2026-05-11 at 15.56.18 (3)':   'Black Platform Chelsea Boots',
  'WhatsApp Image 2026-05-11 at 15.56.18':        'Brown UGG Classic Short Leather Boots',
  'WhatsApp Image 2026-05-11 at 15.56.19 (1)':   'Black Suede Mid-Calf Zip Boots',
  // 15.56.19 (2) and 15.56.19 remain unidentified — add items and map here if needed
  'WhatsApp Image 2026-05-11 at 15.56.19 (2)':   'Black Platform Chelsea Boots',
  'WhatsApp Image 2026-05-11 at 15.56.19':        'Brown Suede Cowboy Boots',
}

async function main() {
  const folder = process.argv[2]
  if (!folder) {
    console.error('Usage: node scripts/upload-shoe-photos.mjs <folder-path>')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const files = readdirSync(folder).filter(f =>
    ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase())
  )

  if (files.length === 0) {
    console.error('No image files found in folder:', folder)
    process.exit(1)
  }

  console.log(`Found ${files.length} image(s) in ${folder}\n`)

  for (const file of files) {
    const key = basename(file, extname(file))
    const itemName = NAME_MAP[key]

    if (!itemName) {
      console.warn(`⚠️  Skipping "${file}" — no matching entry in NAME_MAP`)
      continue
    }

    const filePath = join(folder, file)
    const fileBuffer = readFileSync(filePath)
    const mimeType = extname(file).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
    const storagePath = `${USER_ID}/${Date.now()}-${file}`

    console.log(`Uploading "${file}" → ${storagePath}`)

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true })

    if (uploadError) {
      console.error(`  ✗ Upload failed: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    const { error: updateError } = await supabase
      .from('clothing_items')
      .update({ image_url: publicUrl, thumbnail_url: publicUrl })
      .eq('user_id', USER_ID)
      .eq('name', itemName)

    if (updateError) {
      console.error(`  ✗ DB update failed: ${updateError.message}`)
    } else {
      console.log(`  ✓ Updated "${itemName}"`)
    }
  }

  console.log('\nDone!')
}

main().catch(console.error)
