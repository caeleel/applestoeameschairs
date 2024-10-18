'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Search from '@/components/Search';
import { getSearchResults, hashStringToColor } from '@/lib/util';
import { useRouter } from 'next/navigation';

interface RatingData {
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  rating_6: number;
  rating_7: number;
  rating_8: number;
  rating_9: number;
  rating_10: number;
  score: number;
}

export default function RateItemPage({ params }: { params: { slug: string } }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [bgColor, setBgColor] = useState('')
  const [ratingData, setRatingData] = useState<RatingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingScore, setLoadingScore] = useState(5.0)
  const [userVote, setUserVote] = useState<number | null>(null)

  let maxRating = 0
  if (ratingData) {
    for (let i = 1; i <= 10; i++) {
      if (ratingData[`rating_${i}` as keyof RatingData] > maxRating) {
        maxRating = ratingData[`rating_${i}` as keyof RatingData]
      }
    }
  }

  const router = useRouter()
  useEffect(() => {
    const decodedSlug = decodeURIComponent(params.slug.replace(/_/g, ' '))
    setTitle(decodedSlug)
    setBgColor(hashStringToColor(decodedSlug))

    // Check if user has already voted
    const storedVote = localStorage.getItem(`vote-${params.slug}`)
    if (storedVote) {
      setUserVote(parseInt(storedVote, 10))
      fetchRatings()
    } else {
      setIsLoading(false)
    }

    fetch(`/api/search?q=${encodeURIComponent(decodedSlug)}&limit=1`)
      .then(response => response.json())
      .then(data => {
        const page = getSearchResults(data, decodedSlug)
        if (page) {
          setDescription(page.description || '')
          if (page.thumbnail?.source) {
            setThumbnailUrl(page.thumbnail.source)
          }
        }
      })
      .catch(error => console.error('Error fetching item data:', error))
  }, [params.slug])

  const fetchRatings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/rate/${params.slug}`)
      const data = await response.json()
      setRatingData(data)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRating = async (score: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/rate/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });
      const data = await response.json();
      setRatingData(data);
      setUserVote(score);
      localStorage.setItem(`vote-${params.slug}`, score.toString());
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingScore(+(Math.random() * 9 + 1).toFixed(1))
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const getBarHeight = (rating: number) => {
    if (!ratingData) return '48px'; // Default height before rating
    const height = maxRating > 0 ? (rating / maxRating) * 80 + 20 : 20; // Min height of 20px, max of 100px
    return `${height}px`;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row flex-grow pt-10">
        {/* Left Pane */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-row md:flex-col items-center justify-center p-10 g-4" style={{ backgroundColor: bgColor }}>
          {thumbnailUrl && (
            <div>
              <Image src={thumbnailUrl} alt={title} width={240} height={240} className="w-full h-auto" />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-black mb-2 text-left">{title}</h1>
            {description && (
              <p className="text-l text-gray-800 text-left italic">{description}</p>
            )}
            <div className="mt-8 flex flex-col items-start text-sm">
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:underline mb-2 flex items-center"
              >
                wtf is this
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                onClick={() => {
                  localStorage.setItem(`banned:${params.slug}`, '1');
                  router.push('/rate');
                }}
                className="text-gray-600 hover:underline"
              >
                I don't know or care what this is
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className="w-full h-1/2 md:w-1/2 md:h-full bg-black flex flex-col items-center justify-end relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="text-8xl font-bold animate-pulse" style={{ color: bgColor }}>
                  {loadingScore.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          {ratingData && !isLoading && (
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="text-8xl font-bold" style={{ color: bgColor }}>
                {ratingData.score.toFixed(1)}
              </span>
            </div>
          )}
          <div className="flex justify-center items-end w-full mb-8">
            <div className="flex space-x-1 w-3/4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <div key={rating} className="flex flex-col items-center w-[10%] group">
                  <div className="w-full h-[100px] relative">
                    <div
                      className={`absolute bottom-0 w-full bg-gray-700 transition-all duration-300 ease-in-out
                                ${!ratingData && !isLoading ? 'cursor-pointer h-16 group-hover:h-20 group-hover:bg-[--hover-color]' : ''}
                                ${userVote === rating ? 'bg-[--hover-color]' : ''}`}
                      style={{
                        '--hover-color': bgColor,
                        backgroundColor: ratingData ? (userVote === rating ? bgColor : 'gray') : undefined,
                        height: ratingData ? getBarHeight(ratingData[`rating_${rating}` as keyof RatingData] || 0) : undefined
                      } as React.CSSProperties}
                      onClick={() => !ratingData && !isLoading && handleRating(rating)}
                    ></div>
                  </div>
                  <span
                    className={`text-sm mt-2 ${!ratingData && !isLoading ? 'group-hover:text-[--hover-color]' : ''} 
                                ${userVote === rating ? 'text-[--hover-color]' : 'text-gray-500'}`}
                    style={{ '--hover-color': bgColor } as React.CSSProperties}
                  >
                    {rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Search />
    </>
  )
}
