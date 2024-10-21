'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { hashStringToColor } from '@/lib/util'
import Search from '@/components/Search';

interface Ranking {
  name: string;
  description: string;
  score: number;
}

let offsetFetched = -1;

export default function Home() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastRankingElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset((prevOffset) => {
          return prevOffset + 100
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchRankings = useCallback(async (currentOffset: number) => {
    if (offsetFetched >= currentOffset) return;
    setIsLoading(true);
    offsetFetched = currentOffset;
    try {
      const response = await fetch(`/api/ranks?type=score&offset=${currentOffset}`, { cache: 'no-store' });
      const data = await response.json();
      setRankings(prevRankings => [...prevRankings, ...data]);
      setHasMore(data.length === 100);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings(offset);
  }, [offset, fetchRankings]);

  if (rankings.length === 0 && isLoading) {
    return (
      <>
        <Search />
        <div className="bg-black w-screen h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Search />
      <div className="text-white mt-10">
        <table className="w-full">
          <tbody>
            {rankings.map((item: Ranking, index: number) => {
              const hoverColor = hashStringToColor(item.name);
              const hoverColorTransparent = hashStringToColor(item.name, 0);
              return (
                <tr
                  key={item.name}
                  ref={index === rankings.length - 1 ? lastRankingElementRef : null}
                  className="hover:bg-opacity-80 transition-colors duration-200"
                  style={{ '--hover-bg-color': hoverColor } as React.CSSProperties}
                >
                  <td className="group">
                    <div className="group-hover:bg-[--hover-bg-color] group-hover:text-black flex items-center py-4 pl-2 pr-8 h-16 relative">
                      <div className="flex gap-4 items-center">
                        <div className="w-6 text-right">{index + 1}</div>
                        <Link href={`/rate/${item.name}`} className="text-right w-24 text-4xl hover:underline font-bold">
                          {item.score.toFixed(2)}
                        </Link>
                        <div className="relative" style={{ width: 'calc(100vw - 200px)' }}>
                          <Link href={`/rate/${item.name}`} className="text-lg font-bold hover:underline w-full block overflow-ellipsis overflow-hidden whitespace-nowrap">{item.name.replace(/_/g, ' ')}</Link>
                          <div className="text-xs text-gray-400 group-hover:text-gray-700 w-full block overflow-ellipsis overflow-hidden whitespace-nowrap">{item.description}</div>
                        </div>
                      </div>
                      <div className="absolute right-0 top-0 h-16 pl-12 items-center hidden text-sm group-hover:flex" style={{
                        background: `linear-gradient(90deg, ${hoverColorTransparent} 0%, ${hoverColor} 20%)`
                      }}>
                        <a
                          href={`https://en.wikipedia.org/wiki/${item.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline mr-4"
                        >
                          more deets
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </>
  )
}
