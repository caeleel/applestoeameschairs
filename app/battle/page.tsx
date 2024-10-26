'use client'

import React, { useState, useEffect, useRef } from 'react';
import SplitPanel from '@/components/SplitPanel';
import BattleItem from '@/components/BattleItem';
import { fetchWeightedItems, WeightedItem } from '@/lib/util';

const BANNED_WORDS: string[] = []; // Add your banned words here

function getRandomSlug(items: WeightedItem[], exclude: string[] = []): string {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    if (random < item.weight && !exclude.includes(item.slug) && !BANNED_WORDS.some(word => item.slug.includes(word))) {
      return item.slug;
    }
    random -= item.weight;
  }

  // If we couldn't find a suitable slug, try again (recursive call)
  return getRandomSlug(items, exclude);
}

export default function BattlePage() {
  const [items, setItems] = useState<WeightedItem[]>([]);
  const [battles, setBattles] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadItems() {
      const fetchedItems = await fetchWeightedItems();
      setItems(fetchedItems);
      setIsLoading(false);
    }
    loadItems();
  }, []);

  useEffect(() => {
    if (items.length > 0 && battles.length < 2) {
      const newBattles = Array(2 - battles.length).fill(null).map(() => {
        const leftSlug = getRandomSlug(items);
        const rightSlug = getRandomSlug(items, [leftSlug]);
        return [leftSlug, rightSlug] as [string, string];
      });
      setBattles(prev => [...prev, ...newBattles]);
    }
  }, [items, battles]);

  const handleVote = async (winner: string, loser: string) => {
    // TODO: Implement the network request for voting
    console.log(`Voted for ${winner} over ${loser}`);

    // Wait for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scroll to the next battle
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.clientHeight,
        behavior: 'smooth'
      });
    }

    // Remove the top battle and add a new one
    setBattles(prev => {
      const [, ...rest] = prev;
      const leftSlug = getRandomSlug(items);
      const rightSlug = getRandomSlug(items, [leftSlug]);
      return [...rest, [leftSlug, rightSlug]];
    });
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow">
      {battles.map(([leftSlug, rightSlug], index) => (
        <SplitPanel>
          <BattleItem slug={leftSlug} onVote={() => handleVote(leftSlug, rightSlug)} />
          <BattleItem slug={rightSlug} onVote={() => handleVote(rightSlug, leftSlug)} />
        </SplitPanel>
      ))}
    </div>
  );
}
