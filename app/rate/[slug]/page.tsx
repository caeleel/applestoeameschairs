'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import Search from '@/components/Search';
import { getSearchResults, hashStringToColor } from '@/lib/util';

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
    const height = maxRating > 0 ? (rating / maxRating) * 60 + 10 : 20; // Min height of 20px, max of 100px
    return `${height}px`;
  }

  return (
    <>
      <div className="flex flex-col mt-8 md:flex-row" style={{ height: 'calc(100svh - 64px)' }}>
        {/* Left Pane */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-row md:flex-col items-center justify-center p-4" style={{ backgroundColor: bgColor }}>
          {thumbnailUrl && (
            <div>
              <Image src={thumbnailUrl} alt={title} width={240} height={240} />
            </div>
          )}
          <div className="p-8">
            <h1 className="text-base md:text-2xl font-bold text-black mb-2 md:text-center text-left">{title}</h1>
            {description && (
              <p className="text-sm md:text-lg text-gray-800 md:text-center text-left italic">{description}</p>
            )}
            <div className="mt-8 flex flex-col md:items-center items-start text-sm">
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
      <div className="absolute w-full top-24 flex items-center justify-center z-100 pointer-events-none" style={{ height: 'calc(100% - 104px)' }}>
        <div className="w-16 h-16 relative group cursor-pointer pointer-events-auto" onClick={() => router.push('/rate')}>
          <svg className="w-16 h-16 group-hover:hidden" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="rgb(209 213 219)">
            <path d="M 0 80 C 0 12.000000000000002, 12.000000000000002 0, 80 0 S 160 12.000000000000002, 160 80, 148 160 80 160, 0 148, 0 80" transform="rotate(0,80,80) translate(0,0)"></path>
          </svg>
          <svg className="w-16 h-16 group-hover:block hidden" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="white">
            <path d="M 0 80 C 0 12.000000000000002, 12.000000000000002 0, 80 0 S 160 12.000000000000002, 160 80, 148 160 80 160, 0 148, 0 80" transform="rotate(0,80,80) translate(0,0)"></path>
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg height="36" width="36" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve">
              <path d="M83.745,69.516l-8.181,5.666V67.08c0,0-9.253,0-10.93,0c-15.551,0-29.989-27.566-41.66-27.566H8.069v-6.542h14.906  c18.125,0,29.063,27.65,41.66,27.65c1.76,0,10.93,0,10.93,0V52.52l8.181,5.666l8.186,5.665L83.745,69.516z" />
              <path d="M50.619,45.877c0.375,0.396,0.749,0.794,1.123,1.19c4.344-4.354,8.521-7.69,12.894-7.69c1.76,0,10.93,0,10.93,0v8.103  l8.181-5.666l8.186-5.666l-8.186-5.666l-8.181-5.665v8.102c0,0-9.253,0-10.93,0c-6.048,0-11.926,4.172-17.539,9.269  C48.298,43.419,49.472,44.659,50.619,45.877z" />
              <path d="M37.986,54.719c-0.633-0.626-1.276-1.261-1.923-1.894c-4.649,4.337-9.037,7.661-13.088,7.661H8.069v6.541h14.906  c6.979,0,12.889-4.103,18.243-9.145C40.123,56.824,39.044,55.763,37.986,54.719z" />
            </svg>
          </div>
        </div>
      </div >
    </>
  )
}
