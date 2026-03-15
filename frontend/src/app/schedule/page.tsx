"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getUserSchedule, 
  leaveGame, 
  UserSchedule, 
  User,
  SkillLevel,
  getFacilities,
  deleteBooking,
  getGames
} from '../api/index';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Users, 
  LogOut, 
  ChevronLeft, 
  Loader2, 
  TrendingUp, 
  MapPin, 
  Activity,
  XCircle,
  Share2,
  Clock,
  LayoutDashboard,
  Zap,
  BarChart3
} from 'lucide-react';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<UserSchedule | null>(null);
  const [managedFacilities, setManagedFacilities] = useState<any[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchData = async () => {
    if (!user) return;
    try {
      if (user.role === 'Manager') {
        const fRes = await getFacilities();
        const myVenues = fRes.data.filter(f => f.manager_id === user.id);
        setManagedFacilities(myVenues);
        if (myVenues.length > 0) setSelectedFacilityId(myVenues[0].id);
      } else {
        const res = await getUserSchedule(user.id);
        setSchedule(res.data);
      }
    } catch (err) {
      toast.error("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && user) fetchData();
  }, [isClient, user]);

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;

  const isManager = user?.role === 'Manager';
  const selectedVenue = managedFacilities.find(f => f.id === selectedFacilityId);

  return (
    <div className="min-h-screen bg-white text-[#0B0E14]">
      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {isManager ? (
          <div className="space-y-12 text-black">
            <section className="bg-[#0B0E14] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-[#9EF01A] text-[#0B0E14] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#9EF01A]/20">Command Center</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase mb-2">Venue Analytics</h1>
                <p className="text-gray-400 font-medium max-w-xl">Deep dive into your facility performance and player engagement metrics.</p>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#9EF01A]/5 rounded-full blur-[120px]" />
            </section>

            {/* Venue Selector if multiple */}
            {managedFacilities.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {managedFacilities.map(f => (
                  <button 
                    key={f.id} 
                    onClick={() => setSelectedFacilityId(f.id)}
                    className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${selectedFacilityId === f.id ? 'bg-[#9EF01A] border-[#9EF01A] text-[#0B0E14]' : 'bg-white border-gray-100 text-gray-400 hover:border-[#9EF01A]'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {selectedVenue ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 relative group overflow-hidden">
                    <BarChart3 className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5 group-hover:text-[#9EF01A]/10 transition-colors" />
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Total Bookings (Monthly)</p>
                    <p className="text-6xl font-black mb-4">342</p>
                    <p className="text-xs font-bold text-[#9EF01A] flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> +12% from last month
                    </p>
                  </div>
                  <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 relative group overflow-hidden">
                    <Activity className="absolute -bottom-4 -right-4 w-32 h-32 text-black/5 group-hover:text-[#9EF01A]/10 transition-colors" />
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Active Players</p>
                    <p className="text-6xl font-black mb-4">89</p>
                    <p className="text-xs font-bold text-[#9EF01A] flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> 4 new registrations today
                    </p>
                  </div>
                  <div className="md:col-span-2 bg-[#9EF01A] p-10 rounded-[40px] shadow-xl shadow-[#9EF01A]/20 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#0B0E14]/40 mb-2 tracking-widest">Revenue Forecast</p>
                      <p className="text-5xl font-black text-[#0B0E14]">$4,250.00</p>
                    </div>
                    <Link href={`/facility/${selectedVenue.id}`} className="bg-[#0B0E14] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Manage Venue</Link>
                  </div>
                </div>

                {/* Right: Quick Insights */}
                <div className="bg-white border-2 border-gray-50 p-8 rounded-[40px] shadow-sm">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                    <Zap className="text-[#9EF01A] w-5 h-5" /> Peak Hours
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: "6:00 PM - 9:00 PM", val: 95 },
                      { label: "8:00 AM - 11:00 AM", val: 70 },
                      { label: "1:00 PM - 4:00 PM", val: 30 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-black uppercase mb-2">
                          <span className="text-gray-400">{item.label}</span>
                          <span className="text-[#0B0E14]">{item.val}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0B0E14]" style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-24 text-center bg-gray-50 rounded-[48px] border-4 border-dashed border-gray-100">
                <p className="text-xl font-bold text-gray-400">No venues found to analyze.</p>
              </div>
            )}
          </div>
        ) : (
          /* Player View - Original functionality preserved */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-black">
             <section>
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Reservations</h2>
              <div className="space-y-4">
                {schedule?.bookings.map(b => (
                  <div key={b.id} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all">
                    <p className="text-[10px] font-black text-[#9EF01A] uppercase mb-2 tracking-widest">Court #{b.court_id}</p>
                    <p className="font-black text-2xl">{new Date(b.start_time).toLocaleDateString()}</p>
                    <p className="text-gray-400 font-bold">{new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                  </div>
                ))}
                {schedule?.bookings.length === 0 && <p className="text-gray-400 italic">No court bookings.</p>}
              </div>
            </section>
            
            <section>
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Joined Games</h2>
              <div className="space-y-4">
                {schedule?.games.map(g => (
                  <div key={g.id} className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm relative hover:shadow-xl transition-all group">
                    <h3 className="font-black text-2xl uppercase mb-4 truncate">{g.title}</h3>
                    <div className="flex items-center gap-6 text-xs font-black uppercase text-gray-400">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#9EF01A]" /> {new Date(g.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                      <Link href={`/game/${g.id}`} className="bg-[#0B0E14] text-white px-4 py-2 rounded-xl hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all ml-auto">Details</Link>
                    </div>
                  </div>
                ))}
                {schedule?.games.length === 0 && <p className="text-gray-400 italic">No community games joined.</p>}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
