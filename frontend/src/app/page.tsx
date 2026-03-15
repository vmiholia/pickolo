"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Loader2, LayoutDashboard, Share2, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import { getFacilities, Facility, getUserSchedule, UserSchedule } from './api/index';

const formatTimeAMPM = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export default function Home() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [schedule, setSchedule] = useState<UserSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const fetchData = async () => {
    try {
      const fRes = await getFacilities();
      setFacilities(fRes.data);
      
      if (user && user.role === 'Player') {
        const sRes = await getUserSchedule(user.id);
        setSchedule(sRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) fetchData();
  }, [isClient, user]);

  if (!isClient) return <div className="min-h-screen bg-white" />;

  const isManager = user?.role === 'Manager';
  const myVenues = facilities.filter(f => f.manager_id === user?.id);
  const upcomingBookings = schedule?.bookings.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()).slice(0, 2) || [];

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <main>
        {/* Compact Hero */}
        <section className="bg-[#0B0E14] text-white pt-12 pb-16 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-left">
                <span className="bg-[#9EF01A] text-[#0B0E14] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                  {isManager ? 'Manager Dashboard' : 'Player Portal'}
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight">
                  Hi, {user?.display_name || user?.id || 'Pickolo Player'}
                </h1>
                <p className="text-gray-400 font-medium max-w-md mt-2">
                  {isManager ? "Manage your venues and professional sessions." : "Your next game is just a click away."}
                </p>
              </div>

              {/* Player Quick Stat: Next Booking */}
              {!isManager && user && upcomingBookings.length > 0 && (
                <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl min-w-[280px]">
                   <p className="text-[10px] font-black text-[#9EF01A] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Upcoming Reservation
                   </p>
                   <p className="text-xl font-black">{new Date(upcomingBookings[0].start_time).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                   <p className="text-gray-400 font-bold text-sm">{new Date(upcomingBookings[0].start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                   <Link href="/schedule" className="mt-4 block text-[10px] font-black uppercase text-[#9EF01A] hover:underline">View All Sessions →</Link>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#9EF01A]/5 rounded-full blur-[100px]" />
        </section>

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase">
              {isManager ? "My Managed Venues" : "Explore Venues"}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {(isManager ? myVenues : facilities).map((facility) => {
                const googleMapsLink = facility.google_maps_url || 
                  (facility.latitude && facility.longitude 
                    ? `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}` 
                    : null);

                return (
                  <div key={facility.id} className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col">
                    <Link href={`/facility/${facility.id}`} className="aspect-[16/10] bg-gray-100 relative block">
                      <div className="absolute inset-0 bg-[#0B0E14]/5 group-hover:bg-transparent transition-colors" />
                      {facility.instagram_handle && (
                        <div className="absolute top-6 right-6 bg-white/90 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-pink-600 shadow-sm">
                          @{facility.instagram_handle}
                        </div>
                      )}
                    </Link>
                    <div className="p-8 flex-1 flex flex-col">
                      <Link href={`/facility/${facility.id}`}>
                        <h3 className="text-2xl font-black text-[#0B0E14] mb-2 group-hover:text-[#9EF01A] transition-colors uppercase truncate">
                          {facility.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-4 mb-6">
                        {googleMapsLink && (
                          <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#9EF01A] text-[10px] font-black uppercase tracking-widest hover:underline">
                            <MapPin className="w-3 h-3" /> Map Location
                          </a>
                        )}
                        <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                          {(facility as any).opening_time ? `${formatTimeAMPM((facility as any).opening_time)} - ${formatTimeAMPM((facility as any).closing_time)}` : '8 AM - 10 PM'}
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-2 font-medium">
                        {facility.description || 'Professional pickleball facility.'}
                      </p>
                      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          {isManager ? 'Active Control' : 'Verified Venue'}
                        </span>
                        <Link href={`/facility/${facility.id}`} className="bg-[#0B0E14] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-[#9EF01A] group-hover:text-[#0B0E14] transition-all shadow-lg shadow-black/5">
                          {isManager ? 'Manage' : 'Book Now'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
