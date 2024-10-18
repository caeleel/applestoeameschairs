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
      <div className="bg-white flex items-center justify-start pl-12 pr-10 pt-2 pb-4 h-10 gap-2">
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
        <button
          onClick={() => router.push('/rate')}
          className="hover:bg-gray-100 transition-colors duration-200 p-2"
          aria-label="Shuffle"
        >
          <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xmlSpace="preserve">
            <path d="M83.745,69.516l-8.181,5.666V67.08c0,0-9.253,0-10.93,0c-15.551,0-29.989-27.566-41.66-27.566H8.069v-6.542h14.906  c18.125,0,29.063,27.65,41.66,27.65c1.76,0,10.93,0,10.93,0V52.52l8.181,5.666l8.186,5.665L83.745,69.516z" />
            <path d="M50.619,45.877c0.375,0.396,0.749,0.794,1.123,1.19c4.344-4.354,8.521-7.69,12.894-7.69c1.76,0,10.93,0,10.93,0v8.103  l8.181-5.666l8.186-5.666l-8.186-5.666l-8.181-5.665v8.102c0,0-9.253,0-10.93,0c-6.048,0-11.926,4.172-17.539,9.269  C48.298,43.419,49.472,44.659,50.619,45.877z" />
            <path d="M37.986,54.719c-0.633-0.626-1.276-1.261-1.923-1.894c-4.649,4.337-9.037,7.661-13.088,7.661H8.069v6.541h14.906  c6.979,0,12.889-4.103,18.243-9.145C40.123,56.824,39.044,55.763,37.986,54.719z" />
          </svg>
        </button>
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
