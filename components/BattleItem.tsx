import React from 'react';
import { SearchResult, getSearchResults, hashStringToColor } from '@/lib/util';
import Image from 'next/image';

interface BattleItemProps {
  slug: string;
  onVote: () => void;
}

const BattleItem: React.FC<BattleItemProps> = ({ slug, onVote }) => {
  const [item, setItem] = React.useState<SearchResult | null>(null);
  const backgroundColor = hashStringToColor(slug, 0.5);

  React.useEffect(() => {
    async function fetchItem() {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(slug)}&limit=1`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const result = getSearchResults(data, slug)
        if (result) {
          console.log('setting item', result)
          setItem(result)
        }
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    }
    fetchItem();
  }, [slug]);

  if (!item) {
    return <div className="animate-pulse h-full bg-gray-300"></div>;
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-4 transition-colors duration-300 cursor-pointer"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = backgroundColor)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      onClick={onVote}
    >
      {item.thumbnail && (
        <div className="relative w-48 h-48 mb-4">
          <Image
            src={item.thumbnail.source}
            alt={item.title}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
      )}
      <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
      <p className="text-center">{item.description}</p>
    </div>
  );
};

export default BattleItem;
