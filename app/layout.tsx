import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rank Everything',
  description: 'A website where you can rank everything',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-md">
          <ul className="flex justify-center space-x-4 p-4">
            <li>
              <Link href="/battle" className="hover:text-primary">
                This vs That
              </Link>
            </li>
            <li>
              <Link href="/battle/ranking" className="hover:text-primary">
                This vs That Ranking
              </Link>
            </li>
            <li>
              <Link href="/rate" className="hover:text-primary">
                1 - 10
              </Link>
            </li>
            <li>
              <Link href="/rate/ranking" className="hover:text-primary">
                1 - 10 Ranking
              </Link>
            </li>
          </ul>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
