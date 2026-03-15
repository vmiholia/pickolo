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
      // Sorting by points descending
      const sorted = res.data.sort((a, b) => (b.points || 0) - (a.points || 0));
      setPlayers(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;

  const filteredPlayers = players.filter(p => 
    p.id.toLowerCase().includes(search.toLowerCase()) || 
    p.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-[#0B0E14] py-12">
      <main className="max-w-5xl mx-auto px-4">
        
        {/* Hero */}
        <section className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9EF01A]/10 text-[#9EF01A] rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-[#9EF01A]/20">
            <Trophy className="w-3 h-3" /> Pickolo Hall of Fame
          </div>
          <h1 className="text-7xl font-black tracking-tighter uppercase mb-6 leading-none">Community <br /> <span className="text-[#9EF01A]">Leaderboard</span></h1>
          <p className="text-gray-400 font-medium max-w-xl mx-auto text-lg">Compete with the best players in the community and track your progress to the top.</p>
        </section>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
          {filteredPlayers.slice(0, 3).map((player, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;
            const order = isFirst ? 'order-first md:order-2' : isSecond ? 'order-2 md:order-1' : 'order-3';
            
            return (
              <div key={player.id} className={`flex flex-col items-center ${order}`}>
                <div className={`relative mb-6 group`}>
                  <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center font-black text-4xl shadow-2xl transition-transform group-hover:scale-105 ${isFirst ? 'bg-[#9EF01A] text-[#0B0E14] w-40 h-40' : 'bg-[#0B0E14] text-white'}`}>
                    {(player.display_name || player.id)[0].toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg ${isFirst ? 'bg-[#0B0E14] text-[#9EF01A]' : 'bg-gray-100 text-gray-400'}`}>
                    Rank #{idx + 1}
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase mb-1">{player.display_name || player.id}</h3>
                <p className="text-[#9EF01A] font-black text-sm uppercase tracking-widest">{player.points || 0} Points</p>
              </div>
            );
          })}
        </div>

        {/* Search & List */}
        <div className="bg-gray-50 rounded-[48px] p-10 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tight">Full Rankings</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                className="w-full bg-white border border-gray-200 p-4 pl-12 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-[#9EF01A]/20 transition-all text-black" 
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">Wins</div>
              <div className="col-span-2 text-center">Losses</div>
              <div className="col-span-2 text-right">Points</div>
            </div>
            
            {filteredPlayers.map((player, idx) => (
              <div key={player.id} className="grid grid-cols-12 items-center px-8 py-6 bg-white border border-gray-100 rounded-3xl group hover:shadow-xl transition-all">
                <div className="col-span-1 font-black text-gray-300 group-hover:text-[#9EF01A] transition-colors">#{idx + 1}</div>
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-xs text-[#0B0E14] group-hover:bg-[#9EF01A] transition-colors">
                    {(player.display_name || player.id)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase group-hover:text-[#9EF01A] transition-colors">{player.display_name || player.id}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{player.skill_level}</p>
                  </div>
                </div>
                <div className="col-span-2 text-center font-black text-[#9EF01A]">{player.wins || 0}</div>
                <div className="col-span-2 text-center font-black text-red-400">{player.losses || 0}</div>
                <div className="col-span-2 text-right font-black text-xl tabular-nums">{player.points || 0}</div>
              </div>
            ))}

            {filteredPlayers.length === 0 && <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">No players found matching your search.</div>}
          </div>
        </div>

      </main>
    </div>
  );
}
