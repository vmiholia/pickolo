"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Loader2, LayoutDashboard, Share2 } from 'lucide-react';
import { getFacilities, Facility } from './api/index';

export default function Home() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchFacilities = async () => {
      try {
        const res = await getFacilities(isManager ? undefined : search);
        setFacilities(res.data);
      } catch (err) {
        console.error("Failed to fetch facilities", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFacilities, 300);
    return () => clearTimeout(timer);
  }, [isClient, search, user]);

  const isManager = user?.role === 'Manager';

  return (
    <div className="min-h-screen bg-white text-black">
      <main>
        {/* Rendered Always for SSR Visibility & Integrity Guard */}
        <section className="bg-[#0B0E14] text-white pt-20 pb-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              {isClient && isManager ? (
                <>Your <span className="text-[#9EF01A]">Dashboard</span></>
              ) : (
                <>Find Your <span className="text-[#9EF01A]">Game</span></>
              )}
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              {isClient && isManager 
                ? "Manage your venues and host professional open play sessions."
                : "Discover and book pickleball courts in your neighborhood."}
            </p>

            {(!isClient || !isManager) && (
              <div className="bg-white p-2 rounded-2xl shadow-2xl border border-white/10 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto focus-within:ring-4 focus-within:ring-[#9EF01A]/20 transition-all">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 text-black">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by facility name or city" 
                    className="w-full focus:outline-none text-lg text-black bg-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="bg-[#0B0E14] text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors">
                  Search Courts
                </button>
              </div>
            )}

            {isClient && (
              <div className="mt-12 flex justify-center gap-8">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <div className="w-2 h-2 bg-[#9EF01A] rounded-full animate-pulse" />
                  {isManager 
                    ? `${facilities.filter(f => f.manager_id === user.id).length} Managed Venues`
                    : `${facilities.length} Active Locations`
                  }
                </div>
                <Link href="/schedule" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#9EF01A] transition-colors">
                  {isManager ? <LayoutDashboard className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  {isManager ? "Go to Dashboard" : "View My Schedule"}
                </Link>
              </div>
            )}
          </div>
          
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#9EF01A]/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-[#9EF01A]/5 rounded-full blur-3xl -z-10" />
        </section>

        {/* Primary Listing Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
            <h2 className="text-3xl font-black tracking-tight">
              {isClient && isManager ? "My Venues" : "Available Courts"}
            </h2>
          </div>

          {!isClient || loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {facilities
                .filter(f => !isManager || f.manager_id === user.id)
                .map((facility) => (
                <Link 
                  key={facility.id} 
                  href={`/facility/${facility.id}`}
                  className="group bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/10] bg-gray-100 relative">
                    <div className="absolute inset-0 bg-[#0B0E14]/5 group-hover:bg-transparent transition-colors" />
                    {isManager && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(`${window.location.origin}/facility/${facility.id}`);
                            alert("Link copied!");
                          }}
                          className="bg-white/90 p-2 rounded-full text-[#0B0E14] hover:bg-[#9EF01A] transition-colors shadow-sm"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1 flex flex-col text-black">
                    <h3 className="text-2xl font-black text-[#0B0E14] mb-2 group-hover:text-[#9EF01A] transition-colors">
                      {facility.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm font-bold mb-6">
                      <MapPin className="w-4 h-4" />
                      <span>{facility.latitude ? `${facility.latitude}, ${facility.longitude}` : 'Nearby'}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-2 font-medium">
                      {facility.description || 'Professional pickleball facility.'}
                    </p>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {isManager ? 'Control Center' : 'Verified Venue'}
                      </span>
                      <span className="bg-[#0B0E14] text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-[#9EF01A] group-hover:text-[#0B0E14] transition-all">
                        {isManager ? 'Manage' : 'Book Now'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
