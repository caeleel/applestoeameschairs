import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Global Rankings</h2>
      {/* We'll add the actual ranking list component here later */}
      <div className="flex space-x-4 mt-4">
        <Link href="/rate" className="bg-secondary text-secondary-foreground px-4 py-2 rounded">
          Rate Items
        </Link>
        <Link href="/battle" className="bg-secondary text-secondary-foreground px-4 py-2 rounded">
          Battle Items
        </Link>
      </div>
    </div>
  )
}