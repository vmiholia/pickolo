"use client";

import { useState, useEffect } from 'react';
import { getLeaderboard, getFacilityLeaderboard, getFacilities, Facility, User } from '../api/index';
import { Trophy, Users, Loader2, Search, MapPin } from 'lucide-react';

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | 'global'>('global');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [lRes, fRes] = await Promise.all([
        getLeaderboard(),
        getFacilities()
      ]);
      setPlayers(lRes.data);
      setFacilities(fRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    setLoading(true);
    try {
      if (selectedFacilityId === 'global') {
        const res = await getLeaderboard();
        setPlayers(res.data);
      } else {
        const res = await getFacilityLeaderboard(selectedFacilityId);
        setPlayers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && selectedFacilityId) fetchRankings();
  }, [selectedFacilityId]);

  if (!isClient) return <div className="min-h-screen bg-white" />;

  const filteredPlayers = players.filter(p => 
    p.id.toLowerCase().includes(search.toLowerCase()) || 
    p.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-[#0B0E14] py-12">
      <main className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-4">Rankings</h1>
          <p className="text-gray-400 font-medium">See who's dominating the courts in our community.</p>
        </section>

        {/* View Toggles */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex bg-gray-100 p-1.5 rounded-[20px] w-full md:w-auto">
            <button 
              onClick={() => setSelectedFacilityId('global')}
              className={`flex-1 md:flex-none px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${selectedFacilityId === 'global' ? 'bg-white text-[#0B0E14] shadow-sm' : 'text-gray-400 hover:text-black'}`}
            >
              Global
            </button>
            <div className="relative flex-1 md:flex-none">
              <select 
                className={`w-full appearance-none px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest outline-none bg-transparent ${selectedFacilityId !== 'global' ? 'bg-white text-[#0B0E14] shadow-sm' : 'text-gray-400'}`}
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value === 'global' ? 'global' : parseInt(e.target.value))}
              >
                <option value="global">Select Venue...</option>
                {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-[#9EF01A]/20 transition-all text-black" 
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Rankings List */}
        <div className="bg-white border border-gray-100 rounded-[48px] overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-32">
              <Loader2 className="w-10 h-10 animate-spin text-[#9EF01A]" />
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredPlayers.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between p-8 hover:bg-gray-50 transition-colors group text-black">
                  <div className="flex items-center gap-8">
                    <span className={`text-2xl font-black tabular-nums ${idx < 3 ? 'text-[#9EF01A]' : 'text-gray-200'}`}>
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#0B0E14] text-white rounded-2xl flex items-center justify-center font-black uppercase group-hover:bg-[#9EF01A] group-hover:text-[#0B0E14] transition-colors">
                        {(player.display_name || player.id)[0]}
                      </div>
                      <div>
                        <p className="font-black uppercase text-lg leading-none mb-1">{player.display_name || player.id}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{player.skill_level || 'Member'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black tabular-nums">{player.points || 0}</p>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Experience Pts</p>
                  </div>
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="py-32 text-center">
                  <Trophy className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No rankings found for this view.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
