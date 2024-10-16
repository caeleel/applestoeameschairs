import ItemCard from './ItemCard'

interface RankingListProps {
  items: Array<{ name: string; score: number }>
  type: 'absolute' | 'elo'
}

export default function RankingList({ items = [], type }: RankingListProps) {
  return (
    <div>
      {items.map((item, index) => (
        <ItemCard key={index} name={item.name} score={item.score} type={type} />
      ))}
    </div>
  )
}