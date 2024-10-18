'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { hashStringToColor } from '@/lib/util'
import Search from '@/components/Search';

interface Ranking {
  name: string;
  description: string;
  score: number;
}

export default function Home() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const response = await fetch(`/api/ranks?type=score`, { cache: 'no-store' });
        const data = await response.json();
        setRankings(data);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRankings();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
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
              return (
                <tr
                  key={item.name}
                  className="hover:bg-opacity-80 transition-colors duration-200"
                  style={{ '--hover-bg-color': hoverColor } as React.CSSProperties}
                >
                  <td className="group">
                    <div className="flex gap-4 items-center group-hover:bg-[--hover-bg-color] group-hover:text-black py-4 px-2 h-16">
                      <div className="w-6 text-right">{index + 1}</div>
                      <Link href={`/rate/${item.name}`} className="text-right w-24 text-4xl hover:underline font-bold">
                        {item.score.toFixed(2)}
                      </Link>
                      <div className="flex-grow">
                        <Link href={`/rate/${item.name}`} className="text-lg font-bold hover:underline">{item.name.replace(/_/g, ' ')}</Link>
                        <div className="text-sm text-gray-400 group-hover:text-gray-700">{item.description}</div>
                      </div>
                      <div className="items-center hidden group-hover:flex">
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
      </div>
    </>
  )
}
