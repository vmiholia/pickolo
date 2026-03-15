"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getUserSchedule, 
  leaveGame, 
  UserSchedule, 
  User,
  getFacilities,
  deleteBooking
} from '../api/index';
import toast from 'react-hot-toast';
import { 
  Loader2, 
  TrendingUp, 
  Activity,
  XCircle,
  Share2,
  Clock,
  BarChart3,
  CalendarCheck,
  Calendar,
  Users,
  LogOut,
  MapPin
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
      setLoading(false);
    }
  }, []);

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
      toast.error("Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && user) fetchData();
  }, [isClient, user]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await deleteBooking(bookingId);
      toast.success("Cancelled.");
      fetchData();
    } catch (err) {
      toast.error("Failed.");
    }
  };

  const handleLeaveGame = async (gameId: number) => {
    if (!user) return;
    try {
      await leaveGame(gameId, user.id);
      toast.success("Left the game.");
      fetchData();
    } catch (err) {
      toast.error("Failed.");
    }
  };

  if (!isClient) return <div className="min-h-screen bg-white">Loading Analytics...</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4">
        <CalendarCheck className="w-16 h-16 text-gray-200 mb-6" />
        <h1 className="text-3xl font-black uppercase mb-4">My Schedule & Analytics</h1>
        <p className="text-gray-500 mb-8 font-medium">Please login to view your personalized schedule and venue metrics.</p>
        <Link href="/login" className="px-8 py-4 bg-[#0B0E14] text-white rounded-2xl font-black uppercase tracking-widest text-xs">Login</Link>
      </div>
    );
  }

  const isManager = user?.role === 'Manager';
  const selectedVenue = managedFacilities.find(f => f.id === selectedFacilityId);

  return (
    <div className="min-h-screen bg-white text-[#0B0E14]">
      <div className="sr-only">Schedule Analytics Engine Active</div>
      <main className="max-w-7xl mx-auto px-4 py-12">
        {isManager ? (
          <div className="space-y-12 text-black">
            <section className="bg-[#0B0E14] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-[#9EF01A] text-[#0B0E14] px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#9EF01A]/20">Command Center</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase mb-2">Venue Analytics</h1>
                <p className="text-gray-400 font-medium max-w-xl">Facility performance and engagements.</p>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#9EF01A]/5 rounded-full blur-[120px]" />
            </section>

            {managedFacilities.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {managedFacilities.map(f => (
                  <button key={f.id} onClick={() => setSelectedFacilityId(f.id)} className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border-2 ${selectedFacilityId === f.id ? 'bg-[#9EF01A] border-[#9EF01A] text-[#0B0E14]' : 'bg-white border-gray-100 text-gray-400'}`}>
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {selectedVenue ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 relative group overflow-hidden">
                    <BarChart3 className="absolute -bottom-4 -right-4 w-24 h-24 text-black/5" />
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Total Bookings</p>
                    <p className="text-5xl font-black">342</p>
                  </div>
                  <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 relative group overflow-hidden">
                    <Activity className="absolute -bottom-4 -right-4 w-24 h-24 text-black/5" />
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Active Players</p>
                    <p className="text-5xl font-black">89</p>
                  </div>
                  <div className="md:col-span-2 bg-[#9EF01A] p-10 rounded-[40px] shadow-xl flex justify-between items-center">
                    <p className="text-5xl font-black text-[#0B0E14]">$4,250.00</p>
                    <Link href={`/facility/${selectedVenue.id}`} className="bg-[#0B0E14] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Manage</Link>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">Select a venue to view analytics.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-black">
             <section>
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Reservations</h2>
              <div className="space-y-4">
                {schedule?.bookings.map(b => (
                  <div key={b.id} className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 relative group hover:bg-white hover:shadow-xl transition-all">
                    <button onClick={() => handleCancelBooking(b.id)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">
                      <XCircle className="w-5 h-5" />
                    </button>
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
                    <button onClick={() => handleLeaveGame(g.id)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors">
                      <LogOut className="w-5 h-5" />
                    </button>
                    <h3 className="font-black text-2xl uppercase mb-4 truncate">{g.title}</h3>
                    <div className="flex items-center gap-6 text-xs font-black uppercase text-gray-400">
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#9EF01A]" /> {new Date(g.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                      <div className="flex items-center gap-2 font-black text-[#0B0E14] uppercase text-xs tracking-widest ml-auto">
                        <Link href={`/game/${g.id}`} className="hover:underline">Details</Link>
                      </div>
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
