"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, UserCircle, Trophy } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

const PickoloLogo = () => (
  <div className="flex items-center gap-2">
    <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#9EF01A" stroke="#0B0E14" strokeWidth="2" />
      <circle cx="30" cy="30" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="50" cy="25" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="70" cy="30" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="25" cy="50" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="75" cy="50" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="30" cy="70" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="50" cy="75" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
      <circle cx="70" cy="70" r="5" fill="#fff" stroke="#0B0E14" strokeWidth="1" />
    </svg>
    <span className="text-xl font-black tracking-tight text-[#9EF01A]">pickolo<span className="text-white">.</span></span>
  </div>
);

const Header = () => {
  const [user, setUser] = useState<any>(null);

  const loadUser = () => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    else setUser(null);
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const isManager = user?.role === 'Manager';
  const displayName = user?.display_name || user?.id;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="group">
          <PickoloLogo />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-[#9EF01A] transition-colors">{isManager ? 'Venues' : 'Courts'}</Link>
          <Link href="/leaderboard" className="flex items-center gap-1 hover:text-[#9EF01A] transition-colors">
            <Trophy className="w-4 h-4" /> Community
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                <span className="text-xs font-black uppercase tracking-tighter text-[#9EF01A]">{user.role}</span>
                <span className="text-sm text-gray-400 hidden sm:inline font-bold">| {displayName}</span>
                <UserCircle className="w-4 h-4 text-gray-400" />
              </Link>
              <button 
                onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-[#9EF01A]">Log in</Link>
              <button className="bg-[#9EF01A] text-[#0B0E14] px-4 py-2 rounded-lg text-sm font-bold hover:brightness-105 transition-all">
                Sign up
              </button>
            </>
          )}
          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-50 py-12 border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <div className="flex justify-center mb-4">
        <PickoloLogo />
      </div>
      <p className="text-sm text-gray-400 font-bold">© 2026 Pickolo. All rights reserved.</p>
    </div>
  </footer>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Pickolo - Find & Organize Pickleball</title>
        <meta name="description" content="The digital home for pickleball. Find courts, organize play, and learn." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <Header />
        <div className="min-h-[80vh]">
          {children}
        </div>
        <Footer />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
