'use client'

import { Inter } from 'next/font/google'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

function NavBar() {
  const underlineRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname()

  useEffect(() => {
    const navItems = document.querySelectorAll('.nav-item');
    const navList = document.querySelector('.nav-list');
    const underline = underlineRef.current;
    let activeNavItem: HTMLElement | undefined;

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      let effectivePath = currentPath

      if (currentPath.startsWith('/rate/')) {
        effectivePath = '/rate'
      }

      activeNavItem = Array.from(navItems).find(
        (item) => (item as HTMLAnchorElement).pathname === effectivePath
      ) as HTMLElement | undefined;

      if (activeNavItem && underline) {
        underline.style.width = `${activeNavItem.offsetWidth}px`;
        underline.style.left = `${activeNavItem.offsetLeft}px`;
      }
    }

    function moveUnderline(event: Event) {
      const target = event.target as HTMLElement;
      if (underline && target.classList.contains('nav-item')) {
        underline.style.width = `${target.offsetWidth}px`;
        underline.style.left = `${target.offsetLeft}px`;
      }
    }

    function resetUnderline() {
      if (underline && activeNavItem) {
        underline.style.width = `${activeNavItem.offsetWidth}px`;
        underline.style.left = `${activeNavItem.offsetLeft}px`;
      }
    }

    navItems.forEach(item => {
      item.addEventListener('mouseenter', moveUnderline);
    });
    navList?.addEventListener('mouseleave', resetUnderline);

    return () => {
      navItems.forEach(item => {
        item.removeEventListener('mouseenter', moveUnderline);
      });
      navList?.removeEventListener('mouseleave', resetUnderline);
    };
  }, [pathname]);

  return (
    <nav className="bg-white relative">
      <ul className="flex justify-between items-center py-4 px-12 nav-list">
        <li>
          <Link href="/battle" className="nav-item hover:text-primary">
            This vs That
          </Link>
        </li>
        <li>
          <Link href="/battle/ranking" className="nav-item hover:text-primary">
            This vs That Ranking
          </Link>
        </li>
        <li>
          <Link href="/rate" className="nav-item hover:text-primary">
            1 - 10
          </Link>
        </li>
        <li>
          <Link href="/" className="nav-item hover:text-primary">
            1 - 10 Ranking
          </Link>
        </li>
      </ul>
      <div
        ref={underlineRef}
        className="absolute bottom-3 h-0.5 bg-black transition-all duration-300 ease-in-out"
      ></div>
    </nav>
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
