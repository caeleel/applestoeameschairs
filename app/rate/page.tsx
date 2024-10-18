'use client'

import Search from "@/components/Search"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getRandomSlug(items: [string, number][]) {
  const totalWeight = items.reduce((sum, [_, weight]) => sum + weight, 0)
  let random = Math.random() * totalWeight

  for (const [slug, weight] of items) {
    if (random < weight) return slug
    random -= weight
  }

  return items[0][0] // Fallback to first item if something goes wrong
}

export default function RatePage() {
  const [slug, setSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/filtered.txt')
      .then(response => response.text())
      .then(text => {
        const items: [string, number][] = text.trim().split('\n').map(line => {
          const [slug, weight] = line.split(' ')
          return [slug, parseFloat(weight)]
        })
        const randomSlug = getRandomSlug(items)
        setSlug(randomSlug)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error fetching filtered.txt:', error)
        setIsLoading(false)
      })
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
