"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { getFacilities, Facility } from '../api/index';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const fetchFacilities = async () => {
      try {
        const res = await getFacilities(search);
        setFacilities(res.data);
      } catch (err) {
        console.error("Failed to fetch facilities", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchFacilities, 300);
    return () => clearTimeout(timer);
  }, [isClient, search]);

  if (!isClient) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero / Search Section */}
      <section className="bg-[#0B0E14] text-white pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Find a Court</h1>
          <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by facility name or city" 
                className="w-full focus:outline-none text-lg text-black"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-[#9EF01A] text-[#0B0E14] px-8 py-4 rounded-xl font-bold hover:brightness-105 transition-all">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-12 text-black">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#9EF01A]" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#0B0E14]">
                {facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'} found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <Link 
                  key={facility.id} 
                  href={`/facility/${facility.id}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="aspect-[16/9] bg-gray-100 relative">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    {facility.instagram_handle && (
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-pink-600">
                        @{facility.instagram_handle}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-[#0B0E14]">{facility.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{facility.latitude ? `${facility.latitude}, ${facility.longitude}` : 'Location pending'}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                      {facility.description || 'No description available for this facility.'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-xs font-bold text-[#9EF01A] uppercase tracking-wider">Verified Court</span>
                      <span className="text-[#0B0E14] font-bold text-sm group-hover:underline underline-offset-4 decoration-[#9EF01A] decoration-2">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
