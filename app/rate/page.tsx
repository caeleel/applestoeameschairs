'use client'

import Search from "@/components/Search"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWeightedItems, WeightedItem } from '@/lib/util'

function getRandomSlug(items: WeightedItem[]) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight

  for (const item of items) {
    if (random < item.weight) return item.slug
    random -= item.weight
  }

  return items[0].slug // Fallback to first item if something goes wrong
}

export default function RatePage() {
  const [slug, setSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadRandomSlug() {
      const items = await fetchWeightedItems()
      if (items.length > 0) {
        const randomSlug = getRandomSlug(items)
        setSlug(randomSlug)
      }
      setIsLoading(false)
    }

    loadRandomSlug()
  }, [])

  useEffect(() => {
    if (slug) {
      router.push(`/rate/${slug}`)
    }
  }, [slug, router])

  return (
    <div className="flex-grow">
      <Search />
      <div className="bg-black w-screen h-screen flex items-center justify-center">
        {isLoading && (
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        )}
      </div>
    </div>
  )
}
