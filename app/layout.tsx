'use client'

import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

function NavBar() {
  return (
    <>
      <nav className="bg-white fixed w-full top-0 z-50 text-black">
        <ul className="flex justify-between items-center py-4 px-12 nav-list relative">
          <li className="w-1/3 text-left">
            <Link href="/battle" className="font-medium text-black nav-item hover:text-primary hover:underline">
              This vs That
            </Link>
          </li>
          <li className="w-1/3 text-center">
            <Link href="/rate" className="font-medium text-black nav-item hover:text-primary hover:underline">
              1 - 10
            </Link>
          </li>
          <li className="w-1/3 text-right">
            <Link href="/" className="font-medium text-black nav-item hover:text-primary hover:underline">
              Ranking
            </Link>
          </li>
        </ul>
      </nav>
      <div className="flex w-full mb-16"></div>
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col h-screen bg-black`}>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
