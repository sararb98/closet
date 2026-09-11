'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCapsule, deleteCapsule, setCapsuleItem, type CapsuleWithItems } from '@/lib/actions/capsules'
import type { ClothingItemWithTags } from '@/types/clothing'
import { useToast } from '@/hooks/use-toast'

interface CapsulePlannerProps { capsules: CapsuleWithItems[]; items: ClothingItemWithTags[] }

export function CapsulePlanner({ capsules: initialCapsules, items }: Readonly<CapsulePlannerProps>) {
  const [capsules, setCapsules] = useState(initialCapsules)
  const [activeId, setActiveId] = useState(initialCapsules[0]?.id ?? '')
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { toast } = useToast()
  const activeCapsule = capsules.find((capsule) => capsule.id === activeId)
  const create = async () => {
    const result = await createCapsule({ name, startDate, endDate })
    if (!result.success || !result.capsule) { toast({ title: 'Could not create trip', description: result.error || 'Please try again.', variant: 'destructive' }); return }
    setCapsules((current) => [...current, { ...result.capsule!, items: [] }]); setActiveId(result.capsule.id); setName('')
  }
  const toggle = async (item: ClothingItemWithTags) => {
    if (!activeCapsule) return
    const included = activeCapsule.items.some((entry) => entry.id === item.id)
    const result = await setCapsuleItem(activeCapsule.id, item.id, !included)
    if (!result.success) { toast({ title: 'Could not update packing list', description: result.error || 'Please try again.', variant: 'destructive' }); return }
    setCapsules((current) => current.map((capsule) => capsule.id !== activeCapsule.id ? capsule : { ...capsule, items: included ? capsule.items.filter((entry) => entry.id !== item.id) : [...capsule.items, item] }))
  }
  const remove = async () => {
    if (!activeCapsule) return
    const result = await deleteCapsule(activeCapsule.id)
    if (!result.success) { toast({ title: 'Could not delete trip', description: result.error || 'Please try again.', variant: 'destructive' }); return }
    setCapsules((current) => current.filter((capsule) => capsule.id !== activeCapsule.id)); setActiveId('')
  }
  return <div className="space-y-6 p-4"><section className="grid gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800 md:grid-cols-[1fr_10rem_10rem_auto]"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Trip name" aria-label="Trip name" /><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} aria-label="Trip start date" /><Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} aria-label="Trip end date" /><Button onClick={() => void create()} disabled={!name.trim()}><Plus className="mr-2 h-4 w-4" />Create trip</Button></section><div className="flex gap-2 overflow-x-auto">{capsules.map((capsule) => <Button key={capsule.id} variant={capsule.id === activeId ? 'secondary' : 'outline'} onClick={() => setActiveId(capsule.id)}>{capsule.name} ({capsule.items.length})</Button>)}</div>{activeCapsule ? <section><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-semibold">{activeCapsule.name}</h2><p className="text-sm text-zinc-500">{activeCapsule.start_date} to {activeCapsule.end_date}. Select pieces for your packing list.</p></div><Button variant="ghost" size="icon" aria-label={`Delete ${activeCapsule.name}`} onClick={() => void remove()}><Trash2 className="h-4 w-4 text-red-600" /></Button></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{items.map((item) => { const included = activeCapsule.items.some((entry) => entry.id === item.id); return <button key={item.id} type="button" onClick={() => void toggle(item)} className={`rounded-lg border p-3 text-left ${included ? 'border-zinc-950 bg-zinc-100 dark:border-zinc-50 dark:bg-zinc-900' : 'border-zinc-200 dark:border-zinc-800'} ${item.availability_status === 'laundry' ? 'opacity-50' : ''}`}><p className="truncate text-sm font-medium">{item.name}</p><p className="mt-1 text-xs capitalize text-zinc-500">{included ? 'Packed' : item.availability_status}</p></button> })}</div></section> : <p className="py-12 text-center text-sm text-zinc-500">Create a trip to start a packing list.</p>}</div>
}