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
  Zap
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function FacilityDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const facilityId = parseInt(resolvedParams.id);

  const [facility, setFacility] = useState<Facility | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Settings State
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editOpening, setEditOpening] = useState('08:00');
  const [editClosing, setEditClosing] = useState('22:00');
  const [editLat, setEditLat] = useState('');
  const [editLong, setEditLong] = useState('');
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');
  const [newCourtName, setNewCourtName] = useState('');

  // Advanced Session Creator State
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([new Date().getDay()]);
  const [selectedCourts, setSelectedCourts] = useState<number[]>([]);
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
      const [fRes, cRes, bRes, gRes] = await Promise.all([
        getFacility(facilityId),
        getCourts(facilityId),
        getBookings(facilityId, date),
        getGames()
      ]);
      setFacility(fRes.data);
      setCourts(cRes.data);
      if (cRes.data.length > 0 && selectedCourts.length === 0) setSelectedCourts([cRes.data[0].id]);
      setBookings(bRes.data);
      setGames(gRes.data.filter(g => g.facility_id === facilityId));

      const f = fRes.data as any;
      setEditName(f.name);
      setEditDescription(f.description || '');
      setEditInstagram(f.instagram_handle || '');
      setEditOpening(f.opening_time || '08:00');
      setEditClosing(f.closing_time || '22:00');
      setEditLat(f.latitude?.toString() || '');
      setEditLong(f.longitude?.toString() || '');
      setEditGoogleMapsUrl(f.google_maps_url || '');
      setEditCurrency(f.currency || 'USD');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) fetchData();
  }, [isClient, facilityId, date]);

  const handleUpdateFacility = async () => {
    try {
      await updateFacility(facilityId, {
        name: editName,
        description: editDescription,
        instagram_handle: editInstagram,
        latitude: editLat ? parseFloat(editLat) : undefined,
        longitude: editLong ? parseFloat(editLong) : undefined,
        google_maps_url: editGoogleMapsUrl,
        currency: editCurrency,
        ...({ opening_time: editOpening, closing_time: editClosing } as any)
      });
      toast.success("Facility settings updated!");
      setIsEditingSettings(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to update facility.");
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
      toast.error("Failed to add court.");
    }
  };

  const getNextDatesForDay = (dayOfWeek: number, weeksAhead: number = 4) => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let current = new Date(today);
    while (current.getDay() !== dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }
    
    for (let i = 0; i < weeksAhead; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + (i * 7));
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleBatchCreateSessions = async () => {
    if (!gameTitle || selectedSlots.length === 0 || selectedCourts.length === 0 || selectedDays.length === 0) {
      toast.error("Please fill all configuration options (Title, Courts, Days, Slots).");
      return;
    }
    
    setLoading(true);
    try {
      const promises: Promise<any>[] = [];
      
      selectedDays.forEach(day => {
        const datesToSchedule = getNextDatesForDay(day, 2); // Schedule 2 weeks out for demo
        datesToSchedule.forEach(scheduleDate => {
          selectedSlots.forEach(slot => {
            selectedCourts.forEach(courtId => {
              promises.push(
                createGame({
                  title: gameTitle,
                  facility_id: facilityId,
                  court_id: courtId,
                  start_time: `${scheduleDate}T${slot}:00`,
                  max_players: gamePlayers,
                  skill_level: gameSkill
                })
              );
            });
          });
        });
      });

      await Promise.all(promises);
      toast.success(`Successfully published ${promises.length} sessions!`);
      setIsCreatingGame(false);
      setGameTitle('');
      setSelectedSlots([]);
      fetchData();
    } catch (err) {
      toast.error("Failed to publish some sessions.");
      setLoading(false);
    }
  };

  const handleRemoveGame = async (gameId: number) => {
    if (!confirm("Are you sure you want to remove this session?")) return;
    try {
      await deleteGame(gameId);
      toast.success("Session removed.");
      fetchData();
    } catch (err) {
      toast.error("Failed to remove session.");
    }
  };

  const handleUpdateScore = async (gameId: number) => {
    if ((scoreA < 11 && scoreB < 11) || Math.abs(scoreA - scoreB) < 2) {
      if (!confirm("This score doesn't follow standard 11-win-by-2 rules. Save anyway?")) return;
    }
    try {
      await updateGameScore(gameId, scoreA, scoreB);
      toast.success("Score updated!");
      setEditingScoreId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update score.");
    }
  };

  const handleBooking = async (courtId: number, time: string) => {
    if (!user) {
      toast.error("Please login to book a court.");
      return;
    }
    try {
      await createBooking(courtId, user.id, `${date}T${time}:00`);
      toast.success("Court booked!");
      fetchData();
    } catch (err) {
      toast.error("Booking failed.");
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Cancel this reservation?")) return;
    try {
      await deleteBooking(bookingId);
      toast.success("Cancelled.");
      fetchData();
    } catch (err) {
      toast.error("Failed to cancel.");
    }
  };

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;
  if (!facility) return <div className="p-20 text-center font-bold text-black">Facility not found.</div>;

  const isManager = user?.id === facility.manager_id && user?.role === 'Manager';
  const currencySymbol = facility.currency === 'USD' ? '$' : facility.currency === 'EUR' ? '€' : facility.currency === 'GBP' ? '£' : facility.currency === 'INR' ? '₹' : facility.currency;

  const startHour = parseInt(editOpening.split(':')[0]);
  const endHour = parseInt(editClosing.split(':')[0]);
  const times = Array.from({ length: Math.max(0, endHour - startHour) }, (_, i) => 
    `${(i + startHour).toString().padStart(2, '0')}:00`
  );

  const googleMapsLink = facility.google_maps_url || 
    (facility.latitude && facility.longitude 
      ? `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}` 
      : null);

  return (
    <div className="min-h-screen bg-white text-[#0B0E14]">
      {/* Sub-Nav */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#0B0E14]">
            <ChevronLeft className="w-4 h-4" /> Back to Courts
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              {facility.instagram_handle && (
                <a href={`https://instagram.com/${facility.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#9EF01A] transition-colors">
                  <Instagram className="w-4 h-4" /> @{facility.instagram_handle}
                </a>
              )}
              {isManager && (
                <button onClick={() => setIsEditingSettings(!isEditingSettings)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#0B0E14] underline decoration-[#9EF01A] decoration-2">
                  <Settings className="w-4 h-4" />
                  {isEditingSettings ? "Close Settings" : "Facility Settings"}
                </button>
              )}
            </div>

            {isEditingSettings ? (
              <div className="space-y-8 max-w-3xl bg-gray-50 p-10 rounded-[48px] border border-gray-100 text-black shadow-xl">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#0B0E14] mb-6 border-b border-gray-200 pb-4">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Name</label>
                    <input className="w-full p-4 rounded-2xl border border-gray-200 font-bold outline-none focus:ring-2 focus:ring-[#9EF01A]" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Description</label>
                    <textarea className="w-full p-4 rounded-2xl border border-gray-200 font-bold h-24 outline-none focus:ring-2 focus:ring-[#9EF01A]" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Opening Time</label>
                    <input type="time" className="w-full p-4 rounded-2xl border border-gray-200" value={editOpening} onChange={(e) => setEditOpening(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Closing Time</label>
                    <input type="time" className="w-full p-4 rounded-2xl border border-gray-200" value={editClosing} onChange={(e) => setEditClosing(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Currency</label>
                    <select className="w-full p-4 rounded-2xl border border-gray-200 font-bold" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Google Maps URL (Precedence over Lat/Long)</label>
                    <input className="w-full p-4 rounded-2xl border border-gray-200 font-bold" value={editGoogleMapsUrl} onChange={(e) => setEditGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." />
                  </div>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight text-[#0B0E14] mb-6 mt-8 border-b border-gray-200 pb-4">Inventory Management</h3>
                <div className="flex gap-4 mb-6">
                  <input className="flex-1 p-4 rounded-2xl border border-gray-200 font-bold" placeholder={`New Court Name (e.g. #${courts.length+1})`} value={newCourtName} onChange={(e) => setNewCourtName(e.target.value)} />
                  <button onClick={handleCreateCourt} className="px-8 bg-[#0B0E14] text-white rounded-2xl font-black uppercase tracking-widest text-xs">Add Court</button>
                </div>
                <div className="flex flex-wrap gap-3 mb-8">
                  {courts.map(c => <span key={c.id} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold">{c.name}</span>)}
                  {courts.length === 0 && <span className="text-sm text-gray-400 italic">No courts added yet.</span>}
                </div>

                <button onClick={handleUpdateFacility} className="w-full py-5 bg-[#9EF01A] text-[#0B0E14] rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:brightness-105 transition-all shadow-lg shadow-[#9EF01A]/20">Save All Settings</button>
              </div>
            ) : (
              <>
                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase leading-none">{facility.name}</h1>
                <p className="text-2xl text-gray-500 max-w-3xl leading-relaxed mb-10 font-medium">{facility.description || "The premier destination for pickleball enthusiasts."}</p>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-400">
                    <Clock className="w-5 h-5 text-[#9EF01A]" /> {editOpening} — {editClosing}
                  </div>
                  {googleMapsLink && (
                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-[#9EF01A] transition-all group">
                      <MapPin className="w-5 h-5 text-[#9EF01A]" /> 
                      {facility.latitude && facility.longitude && !facility.google_maps_url ? `${facility.latitude}, ${facility.longitude}` : "View Map Location"}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="w-full lg:w-80">
            {isManager && !isEditingSettings && (
              <button 
                onClick={() => setIsCreatingGame(!isCreatingGame)}
                className={`w-full py-8 rounded-[32px] font-black uppercase tracking-widest text-xs transition-all border-4 shadow-2xl ${isCreatingGame ? 'border-[#0B0E14] bg-white text-[#0B0E14]' : 'bg-[#0B0E14] text-white border-transparent'}`}
              >
                {isCreatingGame ? "Close Creator" : "Host Open Play"}
              </button>
            )}
          </div>
        </div>

        {/* Manager: Venue Analytics Dashboard */}
        {isManager && !isEditingSettings && !isCreatingGame && (
          <section className="mb-20">
            <h2 className="text-3xl font-black tracking-tight mb-8 flex items-center gap-3 text-black">
              <BarChart3 className="text-[#9EF01A] w-8 h-8" /> Venue Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 relative group overflow-hidden">
                <CalendarIcon className="absolute -bottom-4 -right-4 w-24 h-24 text-black/5 group-hover:text-[#9EF01A]/10 transition-colors" />
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Active Bookings</p>
                <p className="text-5xl font-black text-black">{bookings.length}</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 relative group overflow-hidden">
                <Users className="absolute -bottom-4 -right-4 w-24 h-24 text-black/5 group-hover:text-[#9EF01A]/10 transition-colors" />
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Open Plays Today</p>
                <p className="text-5xl font-black text-black">{games.length}</p>
              </div>
              <div className="bg-[#9EF01A] p-8 rounded-[32px] shadow-xl shadow-[#9EF01A]/20">
                <p className="text-[10px] font-black uppercase text-[#0B0E14]/40 mb-2 tracking-widest">Est. Daily Revenue</p>
                <p className="text-5xl font-black text-[#0B0E14]">{currencySymbol}{(bookings.length * 25).toFixed(2)}</p>
                <p className="text-[10px] font-bold text-[#0B0E14]/60 mt-2">Based on {currencySymbol}25/hr rate</p>
              </div>
            </div>
          </section>
        )}

        {/* Advanced Open Play Creator */}
        {isCreatingGame && isManager && (
          <section className="mb-20 bg-[#0B0E14] p-12 rounded-[56px] text-white shadow-2xl shadow-black/20">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-12 text-[#9EF01A] flex items-center gap-4">
              <CalendarDays className="w-8 h-8" /> Advanced Session Creator
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">1. Basic Configuration</label>
                  <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold focus:ring-2 focus:ring-[#9EF01A] outline-none mb-4" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} placeholder="Session Title (e.g. Pro Am)" />
                  <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none mb-4" value={gameSkill} onChange={(e) => setGameSkill(e.target.value as SkillLevel)}>
                    {Object.values(SkillLevel).map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                  </select>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl">
                    <label className="text-xs font-bold text-gray-400 whitespace-nowrap">Max Players:</label>
                    <input type="number" className="w-full bg-transparent text-white font-black outline-none text-right" value={gamePlayers} onChange={(e) => setGamePlayers(parseInt(e.target.value))} />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">2. Court Selection (Multi)</label>
                  <div className="flex flex-wrap gap-2">
                    {courts.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => setSelectedCourts(prev => prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id])}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCourts.includes(c.id) ? 'bg-[#9EF01A] text-[#0B0E14]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                    {courts.length === 0 && <span className="text-xs text-gray-500 italic">Please add courts in settings first.</span>}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">3. Weekly Schedule (Multi-Day)</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day, idx) => (
                      <button 
                        key={day}
                        onClick={() => setSelectedDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx])}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedDays.includes(idx) ? 'bg-[#9EF01A] text-[#0B0E14]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                      >
                        {day.substring(0,3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">4. Time Slots (Multi-Slot)</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {times.map(t => (
                      <button 
                        key={t}
                        onClick={() => setSelectedSlots(prev => prev.includes(t) ? prev.filter(s => s !== t) : [...prev, t])}
                        className={`py-3 rounded-xl font-black text-xs transition-all border ${selectedSlots.includes(t) ? 'bg-[#9EF01A] border-[#9EF01A] text-[#0B0E14]' : 'bg-transparent border-white/10 text-gray-500 hover:border-[#9EF01A]/50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-black text-[#9EF01A] leading-none">{selectedCourts.length * selectedDays.length * selectedSlots.length * 2}</p>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Sessions (2 Weeks)</p>
                  </div>
                  <button onClick={handleBatchCreateSessions} className="px-12 py-5 bg-[#9EF01A] text-[#0B0E14] rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-lg shadow-[#9EF01A]/20">
                    Publish Batch
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Active Open Plays & Scoring */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-black">
              <Users className="text-[#9EF01A] w-10 h-10" /> Community Sessions
            </h2>
            <div className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200 text-sm font-bold text-black flex items-center gap-2">
               <CalendarIcon className="w-4 h-4 text-[#9EF01A]" /> {new Date(date).toLocaleDateString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {games.map(game => (
              <div key={game.id} className="p-10 bg-white border border-gray-100 rounded-[48px] shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden text-black flex flex-col">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#9EF01A] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-8">
                  <span className="px-4 py-1.5 bg-gray-50 rounded-xl text-[10px] font-black text-[#9EF01A] uppercase tracking-widest border border-gray-100">{game.skill_level}</span>
                  {isManager && <button onClick={() => handleRemoveGame(game.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                </div>

                <h3 className="text-3xl font-black mb-2 uppercase truncate">{game.title}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">COURT: {courts.find(c => c.id === game.court_id)?.name || 'TBD'}</p>
                
                <div className="flex items-center gap-8 mb-10">
                  <div className="flex items-center gap-2 font-black text-[#0B0E14] uppercase text-xs tracking-widest"><Clock className="w-5 h-5 text-[#9EF01A]" /> {new Date(game.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  <div className="flex items-center gap-2 font-black text-[#0B0E14] uppercase text-xs tracking-widest"><Users className="w-5 h-5 text-[#9EF01A]" /> {game.max_players} CAP</div>
                </div>

                {/* Score Panel - Available to players in the game or managers */}
                <div className="mb-10 p-6 bg-gray-50 rounded-[32px] border border-gray-100 mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Match Score</span>
                    <Trophy className={`w-5 h-5 ${game.is_finished ? 'text-amber-400' : 'text-gray-200'}`} />
                  </div>
                  {editingScoreId === game.id ? (
                    <div className="flex items-center justify-center gap-4">
                      <input type="number" className="w-20 p-4 rounded-2xl border-none shadow-inner text-center font-black text-2xl text-black outline-none focus:ring-2 focus:ring-[#9EF01A]" value={scoreA} onChange={(e) => setScoreA(parseInt(e.target.value))} />
                      <span className="font-black text-2xl text-gray-300">:</span>
                      <input type="number" className="w-20 p-4 rounded-2xl border-none shadow-inner text-center font-black text-2xl text-black outline-none focus:ring-2 focus:ring-[#9EF01A]" value={scoreB} onChange={(e) => setScoreB(parseInt(e.target.value))} />
                      <button onClick={() => handleUpdateScore(game.id)} className="p-4 bg-[#0B0E14] text-white rounded-2xl hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all"><Save className="w-6 h-6" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black tabular-nums tracking-tighter">{game.score_team_a || 0} : {game.score_team_b || 0}</span>
                      <button onClick={() => { setEditingScoreId(game.id); setScoreA(game.score_team_a || 0); setScoreB(game.score_team_b || 0); }} className="text-[10px] font-black uppercase text-[#9EF01A] hover:underline underline-offset-4 decoration-2">Edit Score</button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Link href={`/game/${game.id}`} className="flex-1 text-center py-5 bg-[#0B0E14] text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all shadow-xl shadow-black/10">Details</Link>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/game/${game.id}`); toast.success("Invite Link Copied"); }} className="p-5 bg-white border border-gray-200 rounded-[20px] hover:bg-[#9EF01A] hover:border-[#9EF01A] transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
            {games.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-[48px] border-4 border-dashed border-gray-100">No community sessions scheduled for this date.</div>}
          </div>
        </section>

        {/* Booking & Slot Management */}
        <div className="bg-white rounded-[64px] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-12 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-black">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-2">Court Timeline</h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-[#9EF01A] rounded-full" /> Live Inventory & Slot Management
              </p>
            </div>
            <input type="date" className="bg-white border border-gray-200 p-4 rounded-2xl font-black text-black outline-none focus:ring-2 focus:ring-[#9EF01A]" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          
          <div className="overflow-x-auto text-black">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-10 border-b border-r border-gray-50 text-left bg-white text-[10px] font-black uppercase text-gray-400 tracking-widest sticky left-0 z-10 w-32">Time</th>
                  {courts.map(c => <th key={c.id} className="p-10 border-b border-gray-50 text-center font-black uppercase text-sm tracking-widest min-w-[200px]">{c.name}</th>)}
                  {courts.length === 0 && <th className="p-10 border-b border-gray-50 text-left font-medium text-gray-400 italic">Please add courts in settings.</th>}
                </tr>
              </thead>
              <tbody>
                {times.map(t => (
                  <tr key={t}>
                    <td className="p-10 border-b border-r border-gray-50 font-black text-gray-400 text-sm bg-gray-50/30 sticky left-0 z-10">{t}</td>
                    {courts.map(c => {
                      const isOpenPlay = games.find(g => g.court_id === c.id && new Date(g.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) === t);
                      const booking = bookings.find(b => b.court_id === c.id && new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) === t);
                      
                      return (
                        <td key={`${c.id}-${t}`} className="p-6 border-b border-gray-50">
                          {isOpenPlay ? (
                            <Link href={`/game/${isOpenPlay.id}`} className="block bg-[#9EF01A]/10 text-[#0B0E14] py-8 rounded-[32px] text-[10px] font-black uppercase tracking-widest text-center border-2 border-[#9EF01A]/30 hover:bg-[#9EF01A]/20 transition-colors">
                              Open Play
                            </Link>
                          ) : booking ? (
                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex flex-col items-center justify-center gap-3 h-full">
                              <span className="text-[10px] font-black uppercase text-gray-400">Reserved by</span>
                              <span className="font-black text-xs uppercase truncate max-w-[120px] text-[#0B0E14]">{booking.user_id}</span>
                              {(isManager || user?.id === booking.user_id) && (
                                <button onClick={() => handleCancelBooking(booking.id)} className="text-red-400 hover:text-red-600 transition-colors mt-2">
                                  <XCircle className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <button onClick={() => handleBooking(c.id, t)} disabled={isManager} className={`w-full py-10 rounded-[32px] border-2 border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-[#9EF01A] hover:bg-[#9EF01A]/5 hover:text-[#0B0E14] transition-all disabled:opacity-50`}>
                              Book Slot
                            </button>
                          )}
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
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(158, 240, 26, 0.5);
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}

export default function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>}><FacilityDetailContent params={params} /></Suspense>;
}
