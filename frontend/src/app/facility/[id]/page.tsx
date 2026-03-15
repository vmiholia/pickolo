"use client";

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { 
  getFacility, 
  getCourts, 
  getBookings, 
  createBooking, 
  updateFacility, 
  createCourt,
  createGame,
  getGames,
  deleteGame,
  updateGameScore,
  deleteBooking,
  Facility,
  Court,
  Booking,
  User,
  SkillLevel,
  Game
} from '../../api/index';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, 
  Instagram, 
  MapPin, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock,
  Loader2,
  Settings,
  Users,
  Share2,
  Trophy,
  XCircle,
  Save,
  ExternalLink,
  Trash2,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTimeAMPM = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

function FacilityDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const facilityId = parseInt(resolvedParams.id);

  const [facility, setFacility] = useState<Facility | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Timeline State - No more court tabs, showing week view
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Settings State
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editOpening, setEditOpening] = useState('08:00');
  const [editClosing, setEditClosing] = useState('22:00');
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [newCourtName, setNewCourtName] = useState('');

  // Advanced Session Creator State
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedCreatorCourts, setSelectedCreatorCourts] = useState<number[]>([]);
  const [gameSkill, setGameSkill] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);
  const [gamePlayers, setGamePlayers] = useState(4);

  // Score Management State
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const fetchData = async () => {
    if (isNaN(facilityId)) return;
    try {
      const [fRes, cRes, gRes] = await Promise.all([
        getFacility(facilityId),
        getCourts(facilityId),
        getGames()
      ]);
      setFacility(fRes.data);
      setCourts(cRes.data);
      if (cRes.data.length > 0 && selectedCreatorCourts.length === 0) setSelectedCreatorCourts([cRes.data[0].id]);
      setGames(gRes.data.filter(g => g.facility_id === facilityId));

      const f = fRes.data as any;
      setEditName(f.name);
      setEditDescription(f.description || '');
      setEditInstagram(f.instagram_handle || '');
      setEditOpening(f.opening_time || '08:00');
      setEditClosing(f.closing_time || '22:00');
      setEditGoogleMapsUrl(f.google_maps_url || '');
      setEditCurrency(f.currency || 'USD');

      // Fetch bookings for the whole week
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
      });
      
      const bPromises = weekDates.map(d => getBookings(facilityId, d));
      const bResponses = await Promise.all(bPromises);
      setBookings(bResponses.flatMap(r => r.data));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) fetchData();
  }, [isClient, facilityId, startDate]);

  const handleUpdateFacility = async () => {
    try {
      await updateFacility(facilityId, {
        name: editName,
        description: editDescription,
        instagram_handle: editInstagram,
        google_maps_url: editGoogleMapsUrl,
        currency: editCurrency,
        ...({ opening_time: editOpening, closing_time: editClosing } as any)
      });
      toast.success("Settings updated!");
      setIsEditingSettings(false);
      fetchData();
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleCreateCourt = async () => {
    const name = newCourtName || `#${courts.length + 1}`;
    try {
      await createCourt(name, facilityId);
      toast.success(`Court ${name} added!`);
      setNewCourtName('');
      fetchData();
    } catch (err) {
      toast.error("Failed.");
    }
  };

  const handleBatchCreateSessions = async () => {
    if (!gameTitle || selectedSlots.length === 0 || selectedCreatorCourts.length === 0) {
      toast.error("Select title, courts, and slots.");
      return;
    }
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];
      selectedCreatorCourts.forEach(courtId => {
        selectedSlots.forEach(slot => {
          promises.push(createGame({
            title: gameTitle,
            facility_id: facilityId,
            court_id: courtId,
            start_time: `${startDate}T${slot}:00`,
            max_players: gamePlayers,
            skill_level: gameSkill
          }));
        });
      });
      await Promise.all(promises);
      toast.success(`Published ${promises.length} sessions!`);
      setIsCreatingGame(false);
      fetchData();
    } catch (err) {
      toast.error("Failed.");
      setLoading(false);
    }
  };

  const handleRemoveGame = async (gameId: number) => {
    if (!confirm("Remove this session?")) return;
    try {
      await deleteGame(gameId);
      toast.success("Removed.");
      fetchData();
    } catch (err) {
      toast.error("Failed.");
    }
  };

  const handleUpdateScore = async (gameId: number) => {
    try {
      await updateGameScore(gameId, scoreA, scoreB);
      toast.success("Score updated!");
      setEditingScoreId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed.");
    }
  };

  const handleBooking = async (courtId: number, slotDate: string, time: string) => {
    if (!user) return toast.error("Login to book.");
    try {
      await createBooking(courtId, user.id, `${slotDate}T${time}:00`);
      toast.success("Booked!");
      fetchData();
    } catch (err) {
      toast.error("Booking failed.");
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Cancel reservation?")) return;
    try {
      await deleteBooking(bookingId);
      toast.success("Cancelled.");
      fetchData();
    } catch (err) {
      toast.error("Failed.");
    }
  };

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;
  if (!facility) return <div className="p-20 text-center font-bold text-black">Facility not found.</div>;

  const isManager = user?.id === facility.manager_id && user?.role === 'Manager';
  const currencySymbol = facility.currency === 'INR' ? '₹' : (facility.currency === 'USD' ? '$' : facility.currency);

  const startHour = parseInt(editOpening.split(':')[0]);
  const endHour = parseInt(editClosing.split(':')[0]);
  const timeSlots = Array.from({ length: endHour - startHour }, (_, i) => 
    `${(i + startHour).toString().padStart(2, '0')}:00`
  );

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const googleMapsLink = facility.google_maps_url || 
    (facility.latitude && facility.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}` 
      : null);

  return (
    <div className="min-h-screen bg-white text-[#0B0E14]">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#0B0E14]">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          {isManager && (
            <button onClick={() => setIsEditingSettings(!isEditingSettings)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0B0E14] flex items-center gap-1">
              <Settings className="w-3 h-3" /> Settings
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          <div className="flex-1">
            <h1 className="text-7xl font-black mb-6 tracking-tighter uppercase leading-none">{facility.name}</h1>
            <div className="flex flex-wrap items-center gap-6 mb-8">
               <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-400">
                  <Clock className="w-4 h-4 text-[#9EF01A]" /> {formatTimeAMPM(editOpening)} — {formatTimeAMPM(editClosing)}
               </div>
               {googleMapsLink && (
                 <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-400 hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all">
                    <MapPin className="w-4 h-4 text-[#9EF01A]" /> Map Location
                 </a>
               )}
            </div>
            
            {isEditingSettings ? (
              <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 text-black shadow-xl">
                 <h3 className="text-xl font-black uppercase mb-6">Configuration</h3>
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <input className="col-span-2 p-4 rounded-xl border border-gray-200 font-bold" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Venue Name" />
                    <input type="time" className="p-4 rounded-xl border border-gray-200" value={editOpening} onChange={(e) => setEditOpening(e.target.value)} />
                    <input type="time" className="p-4 rounded-xl border border-gray-200" value={editClosing} onChange={(e) => setEditClosing(e.target.value)} />
                    <select className="p-4 rounded-xl border border-gray-200 font-bold" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)}>
                       {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input className="p-4 rounded-xl border border-gray-200 font-bold" value={editGoogleMapsUrl} onChange={(e) => setEditGoogleMapsUrl(e.target.value)} placeholder="Google Maps URL" />
                 </div>
                 <div className="flex gap-2 mb-6">
                    <input className="flex-1 p-4 rounded-xl border border-gray-200 font-bold" value={newCourtName} onChange={(e) => setNewCourtName(e.target.value)} placeholder="New Court Name" />
                    <button onClick={handleCreateCourt} className="px-6 bg-[#0B0E14] text-white rounded-xl font-black uppercase text-[10px]">Add</button>
                 </div>
                 <div className="flex flex-wrap gap-2 mb-8">{courts.map(c => <span key={c.id} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase">{c.name}</span>)}</div>
                 <button onClick={handleUpdateFacility} className="w-full py-4 bg-[#9EF01A] text-[#0B0E14] rounded-2xl font-black uppercase tracking-widest text-xs">Save Settings</button>
              </div>
            ) : (
              <p className="text-xl text-gray-500 max-w-3xl leading-relaxed font-medium">{facility.description}</p>
            )}
          </div>

          <div className="w-full lg:w-80">
            {isManager && !isEditingSettings && (
              <div className="bg-[#0B0E14] p-10 rounded-[48px] text-white shadow-2xl">
                 <p className="text-[10px] font-black uppercase text-gray-500 mb-2 tracking-widest">Revenue Forecast</p>
                 <p className="text-4xl font-black text-[#9EF01A]">{currencySymbol}{(bookings.length * 25).toFixed(2)}</p>
                 <button onClick={() => setIsCreatingGame(!isCreatingGame)} className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all shadow-xl">Host Open Play</button>
              </div>
            )}
          </div>
        </div>

        {isCreatingGame && isManager && (
          <section className="mb-20 bg-[#0B0E14] p-12 rounded-[56px] text-white">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-12 text-[#9EF01A]">Session Creator</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-6">
                <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} placeholder="Title" />
                <div className="flex flex-wrap gap-2">
                  {courts.map(c => (
                    <button key={c.id} onClick={() => setSelectedCreatorCourts(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCreatorCourts.includes(c.id) ? 'bg-[#9EF01A] text-[#0B0E14]' : 'bg-white/5 text-gray-400'}`}>{c.name}</button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-10">
                  {timeSlots.map(t => (
                    <button key={t} onClick={() => setSelectedSlots(prev => prev.includes(t) ? prev.filter(s => s !== t) : [...prev, t])} className={`py-2 rounded-lg font-black text-[10px] transition-all border ${selectedSlots.includes(t) ? 'bg-[#9EF01A] border-[#9EF01A] text-[#0B0E14]' : 'bg-transparent border-white/10 text-gray-500'}`}>{formatTimeAMPM(t)}</button>
                  ))}
                </div>
                <button onClick={handleBatchCreateSessions} className="w-full py-5 bg-[#9EF01A] text-[#0B0E14] rounded-2xl font-black uppercase tracking-widest text-xs">Publish Batch</button>
              </div>
            </div>
          </section>
        )}

        {/* 7-DAY INTEGRATED COURT TIMELINE (4 BOXES GRID) */}
        <div className="bg-white rounded-[48px] border border-gray-100 shadow-2xl">
          <div className="p-10 bg-gray-50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-black">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black tracking-tighter">7-Day Master Timeline</h2>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#9EF01A] rounded-sm"/> Open Play</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-200 rounded-sm"/> Reserved</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 border border-dashed border-gray-300 rounded-sm"/> Available</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
              <CalendarIcon className="w-4 h-4 text-[#9EF01A]" />
              <input type="date" className="bg-transparent font-black text-xs outline-none text-black cursor-pointer" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          
          <div className="text-black overflow-x-auto overflow-y-visible">
            <table className="min-w-full border-separate border-spacing-0 border-none">
              <thead className="sticky top-[64px] z-30 bg-white">
                <tr>
                  <th className="p-6 border-b border-r border-gray-100 text-left bg-white text-[10px] font-black uppercase text-gray-400 tracking-widest sticky top-[64px] left-0 z-40 w-24">Time</th>
                  {weekDates.map(d => (
                    <th key={d} className="p-6 border-b border-gray-100 text-center bg-gray-50 min-w-[160px] sticky top-[64px] z-30">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0B0E14]">{DAYS_OF_WEEK[new Date(d).getUTCDay()]}</span>
                      <p className="text-xs font-bold text-gray-400">{new Date(d).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(t => (
                  <tr key={t} className="group">
                    <td className="p-6 border-b border-r border-gray-100 font-black text-gray-400 text-[10px] bg-white sticky left-0 z-20">{formatTimeAMPM(t)}</td>
                    {weekDates.map(d => {
                      return (
                        <td key={`${d}-${t}`} className="p-2 border-b border-gray-50 align-top">
                          <div className="grid grid-cols-2 gap-1.5 p-1">
                            {courts.map((court, idx) => {
                              const openPlay = games.find(g => g.court_id === court.id && new Date(g.start_time).toISOString().startsWith(d) && new Date(g.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) === t);
                              const booking = bookings.find(b => b.court_id === court.id && new Date(b.start_time).toISOString().startsWith(d) && new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) === t);
                              
                              if (openPlay) return (
                                <Link key={court.id} href={`/game/${openPlay.id}`} className="aspect-square bg-[#9EF01A] rounded-lg flex items-center justify-center text-[#0B0E14] hover:scale-110 transition-all shadow-sm" title={`${court.name}: ${openPlay.title}`}>
                                  <Trophy className="w-3 h-3" />
                                </Link>
                              );
                              
                              if (booking) return (
                                <div key={court.id} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative group/box" title={`${court.name}: Reserved`}>
                                  <CheckCircle2 className="w-3 h-3 text-gray-300" />
                                  {(isManager || user?.id === booking.user_id) && (
                                    <button onClick={() => handleCancelBooking(booking.id)} className="absolute inset-0 bg-red-500/90 rounded-lg opacity-0 group-box/hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <XCircle className="w-3 h-3 text-white" />
                                    </button>
                                  )}
                                </div>
                              );

                              return (
                                <button key={court.id} onClick={() => handleBooking(court.id, d, t)} disabled={isManager} className="aspect-square border-2 border-dashed border-gray-100 rounded-lg flex items-center justify-center text-gray-200 hover:border-[#9EF01A] hover:bg-[#9EF01A]/5 hover:text-[#0B0E14] transition-all disabled:opacity-50" title={`${court.name}: Available`}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              );
                            })}
                            {/* Fallback if less than 4 courts to keep the "4 box" aesthetic or handle dynamically */}
                            {Array.from({ length: Math.max(0, 4 - courts.length) }).map((_, i) => (
                              <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-lg border border-gray-50" />
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>}><FacilityDetailContent params={params} /></Suspense>;
}
