interface ItemCardProps {
  name: string
  score: number
  type: 'absolute' | 'elo'
}

export default function ItemCard({ name, score, type }: ItemCardProps) {
  return (
    <div className="border rounded p-4 mb-2">
      <h3 className="font-semibold">{name}</h3>
      <p>{type === 'absolute' ? 'Rating' : 'ELO'}: {score}</p>
    </div>
  )
}
