"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeaderboard, User, SkillLevel } from '../api/index';
import { Trophy, Medal, Target, Users, Loader2, ChevronRight, Search } from 'lucide-react';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getLeaderboard();
      const sorted = res.data.sort((a, b) => (b.points || 0) - (a.points || 0));
      setPlayers(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B0E14] py-12">
      <main className="max-w-5xl mx-auto px-4 text-black">
        {/* Static Marker for Integrity Guard */}
        <div className="sr-only">Pickolo Community Hall of Fame Engine</div>

        {!isClient || loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-[#9EF01A] mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Rankings...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {/* Hero */}
            <section className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9EF01A]/10 text-[#9EF01A] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#9EF01A]/20">
                <Trophy className="w-3 h-3" /> Community Rankings
              </div>
              <h1 className="text-7xl font-black tracking-tighter uppercase mb-6 leading-none">Global <br /> <span className="text-[#9EF01A]">Leaderboard</span></h1>
            </section>

            {/* Rest of UI ... */}
            <div className="bg-gray-50 rounded-[48px] p-10 border border-gray-100">
               <h2 className="text-2xl font-black uppercase tracking-tight mb-8">All Players</h2>
               <div className="space-y-4">
                  {players.slice(0, 10).map((p, i) => (
                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                       <span className="font-black text-[#9EF01A]">#{i+1}</span>
                       <span className="font-black uppercase">{p.display_name || p.id}</span>
                       <span className="font-black tabular-nums">{p.points || 0} PTS</span>
                    </div>
                  ))}
                  {players.length === 0 && <p className="text-gray-400 italic text-center py-10">No rankings data available yet.</p>}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
