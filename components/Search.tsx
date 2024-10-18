'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import debounce from 'lodash/debounce'
import { SearchResult } from '@/lib/util'

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const debouncedSearch = useCallback(debounce(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
      const data = await response.json()

      if (data.query && data.query.pages) {
        const results = (Object.values(data.query.pages) as SearchResult[])
          .sort((a, b) => a.index - b.index)
          .map((page) => ({
            index: page.index,
            title: page.title,
            description: page.description,
            thumbnail: page.thumbnail
          }))
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Error fetching search results:', error)
      setSearchResults([])
    }
  }, 300), [])

  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsResultsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleResultClick = (result: SearchResult) => {
    router.push(`/rate/${result.title.replace(/ /g, '_')}`)
    setIsResultsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="absolute top-12 left-0 right-0">
      <div className="bg-white flex items-center justify-start px-12 pt-2 pb-4 h-10 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search to rate"
          className="w-full p-2 text-gray-900 rounded-lg focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsResultsOpen(true)}
        />
      </div>
      {isResultsOpen && searchResults.length > 0 && (
        <ul className="absolute bg-white border mt-2 shadow-2xl z-10 w-96 left-10">
          {searchResults.map((result) => (
            <li key={result.index} className="px-4 py-4 hover:bg-gray-100 flex items-center">
              <div onMouseDown={() => handleResultClick(result)} className="flex items-center w-full cursor-pointer">
                <div className="w-[60px] h-[60px] mr-4 rounded bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {result.thumbnail ? (
                    <Image
                      src={result.thumbnail.source}
                      alt={result.title}
                      width={60}
                      height={60}
                      className="rounded object-cover min-h-full min-w-full"
                    />
                  ) : null}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold truncate">{result.title}</h3>
                  {result.description && (
                    <p className="text-sm text-gray-600 truncate">{result.description}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
