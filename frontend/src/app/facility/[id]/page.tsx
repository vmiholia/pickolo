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
  CalendarDays
} from 'lucide-react';

function FacilityDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const facilityId = parseInt(resolvedParams.id);

  const [facility, setFacility] = useState<Facility | any>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Manager state: Settings
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editOpening, setEditOpening] = useState('08:00');
  const [editClosing, setEditClosing] = useState('22:00');
  const [editLat, setEditLat] = useState('');
  const [editLong, setEditLong] = useState('');
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState('');
  const [newCourtName, setNewCourtName] = useState('');

  // Open Play Creator State
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([new Date().getDay()]); // 0-6
  const [gameCourtId, setGameCourtId] = useState<number>(0);
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
      if (cRes.data.length > 0 && !gameCourtId) setGameCourtId(cRes.data[0].id);
      setBookings(bRes.data);
      setGames(gRes.data.filter(g => g.facility_id === facilityId));

      setEditName(fRes.data.name);
      setEditDescription(fRes.data.description || '');
      setEditInstagram(fRes.data.instagram_handle || '');
      setEditOpening((fRes.data as any).opening_time || '08:00');
      setEditClosing((fRes.data as any).closing_time || '22:00');
      setEditLat(fRes.data.latitude?.toString() || '');
      setEditLong(fRes.data.longitude?.toString() || '');
      setEditGoogleMapsUrl(fRes.data.google_maps_url || '');
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
        ...({ opening_time: editOpening, closing_time: editClosing } as any)
      });
      toast.success("Facility updated!");
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
      toast.error("Failed to add court.");
    }
  };

  const handleBatchCreateSessions = async () => {
    if (!gameTitle || selectedSlots.length === 0) {
      toast.error("Title and slots required.");
      return;
    }
    try {
      // For simplicity, we create for the current selected date but for all selected slots
      // A more complex implementation would handle multiple days across weeks
      const promises = selectedSlots.map(slot => 
        createGame({
          title: gameTitle,
          facility_id: facilityId,
          court_id: gameCourtId,
          start_time: `${date}T${slot}:00`,
          max_players: gamePlayers,
          skill_level: gameSkill
        })
      );
      await Promise.all(promises);
      toast.success(`Published ${selectedSlots.length} sessions!`);
      setIsCreatingGame(false);
      setSelectedSlots([]);
      fetchData();
    } catch (err) {
      toast.error("Failed to publish sessions.");
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

  const handleUpdateScore = async (gameId: number) => {
    // Pickleball Rules Check: Typically to 11, win by 2
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

  const isManager = user?.id === facility?.manager_id && user?.role === 'Manager';

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;
  if (!facility) return <div className="p-20 text-center font-bold text-black">Facility not found.</div>;

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
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Name</label>
                    <input className="w-full p-4 rounded-2xl border border-gray-200 font-bold" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Opening</label>
                    <input type="time" className="w-full p-4 rounded-2xl border border-gray-200" value={editOpening} onChange={(e) => setEditOpening(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Closing</label>
                    <input type="time" className="w-full p-4 rounded-2xl border border-gray-200" value={editClosing} onChange={(e) => setEditClosing(e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Google Maps URL</label>
                    <input className="w-full p-4 rounded-2xl border border-gray-200" value={editGoogleMapsUrl} onChange={(e) => setEditGoogleMapsUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-200">
                  <h4 className="text-sm font-black uppercase tracking-widest mb-6">Court Management</h4>
                  <div className="flex gap-4 mb-6">
                    <input className="flex-1 p-4 rounded-2xl border border-gray-200 font-bold" placeholder={`New Court Name (e.g. #${courts.length+1})`} value={newCourtName} onChange={(e) => setNewCourtName(e.target.value)} />
                    <button onClick={handleCreateCourt} className="px-8 bg-[#0B0E14] text-white rounded-2xl font-black uppercase tracking-widest text-xs">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {courts.map(c => <span key={c.id} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold">{c.name}</span>)}
                  </div>
                </div>

                <button onClick={handleUpdateFacility} className="w-full py-5 bg-[#9EF01A] text-[#0B0E14] rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:brightness-105 transition-all shadow-lg shadow-[#9EF01A]/20">Save All Changes</button>
              </div>
            ) : (
              <>
                <h1 className="text-7xl font-black mb-6 tracking-tighter uppercase leading-none">{facility.name}</h1>
                <p className="text-2xl text-gray-500 max-w-3xl leading-relaxed mb-10 font-medium">{facility.description}</p>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-400">
                    <Clock className="w-5 h-5 text-[#9EF01A]" /> {editOpening} — {editClosing}
                  </div>
                  {googleMapsLink && (
                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-[#9EF01A] transition-all">
                      <MapPin className="w-5 h-5 text-[#9EF01A]" /> 
                      {facility.latitude ? `${facility.latitude}, ${facility.longitude}` : "View Location"}
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
                {isCreatingGame ? "Cancel Creator" : "Host Open Play"}
              </button>
            )}
          </div>
        </div>

        {/* Advanced Open Play Creator */}
        {isCreatingGame && isManager && (
          <section className="mb-20 bg-[#0B0E14] p-12 rounded-[56px] text-white shadow-2xl shadow-black/20">
            <h3 className="text-3xl font-black uppercase tracking-tight mb-12 text-[#9EF01A] flex items-center gap-4">
              <CalendarDays className="w-8 h-8" /> Advanced Session Creator
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">1. Basic Info</label>
                  <input className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold focus:ring-2 focus:ring-[#9EF01A] outline-none mb-4" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} placeholder="Session Title" />
                  <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold outline-none" value={gameSkill} onChange={(e) => setGameSkill(e.target.value as SkillLevel)}>
                    {Object.values(SkillLevel).map(s => <option key={s} value={s} className="text-black">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">2. Court Selection</label>
                  <div className="flex flex-wrap gap-2">
                    {courts.map(c => (
                      <button key={c.id} onClick={() => setGameCourtId(c.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gameCourtId === c.id ? 'bg-[#9EF01A] text-[#0B0E14]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{c.name}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4 block">3. Select Multiple Slots for {new Date(date).toLocaleDateString()}</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {times.map(t => (
                    <button 
                      key={t}
                      onClick={() => setSelectedSlots(prev => prev.includes(t) ? prev.filter(s => s !== t) : [...prev, t])}
                      className={`py-4 rounded-2xl font-black text-xs transition-all border-2 ${selectedSlots.includes(t) ? 'bg-[#9EF01A] border-[#9EF01A] text-[#0B0E14]' : 'bg-transparent border-white/10 text-gray-500 hover:border-[#9EF01A]/50'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-12 flex justify-end gap-4">
                  <div className="text-right mr-4">
                    <p className="text-2xl font-black text-[#9EF01A] leading-none">{selectedSlots.length}</p>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sessions to publish</p>
                  </div>
                  <button onClick={handleBatchCreateSessions} className="px-12 py-5 bg-[#9EF01A] text-[#0B0E14] rounded-[24px] font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Publish Batch</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Active Open Plays & Scoring */}
        <section className="mb-20">
          <h2 className="text-4xl font-black tracking-tighter mb-12 flex items-center gap-4 text-black">
            <Trophy className="text-[#9EF01A] w-10 h-10" /> Community Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {games.map(game => (
              <div key={game.id} className="p-10 bg-white border border-gray-100 rounded-[48px] shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden text-black">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#9EF01A]" />
                <div className="flex justify-between items-start mb-8">
                  <span className="px-4 py-1.5 bg-gray-50 rounded-xl text-[10px] font-black text-[#9EF01A] uppercase tracking-widest border border-gray-100">{game.skill_level}</span>
                  {isManager && <button onClick={() => handleRemoveGame(game.id)} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                </div>

                <h3 className="text-3xl font-black mb-2 uppercase truncate">{game.title}</h3>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">COURT: {courts.find(c => c.id === game.court_id)?.name || 'MAIN'}</p>
                
                <div className="flex items-center gap-8 mb-12">
                  <div className="flex items-center gap-2 font-black text-[#0B0E14] uppercase text-xs tracking-widest"><Clock className="w-5 h-5 text-[#9EF01A]" /> {new Date(game.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  <div className="flex items-center gap-2 font-black text-[#0B0E14] uppercase text-xs tracking-widest"><Users className="w-5 h-5 text-[#9EF01A]" /> {game.max_players} CAP</div>
                </div>

                {/* Score Panel */}
                <div className="mb-10 p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Final Match Score</span>
                    <Trophy className={`w-5 h-5 ${game.is_finished ? 'text-amber-400' : 'text-gray-200'}`} />
                  </div>
                  {editingScoreId === game.id ? (
                    <div className="flex items-center justify-center gap-4">
                      <input type="number" className="w-20 p-4 rounded-2xl border-none shadow-inner text-center font-black text-2xl text-black" value={scoreA} onChange={(e) => setScoreA(parseInt(e.target.value))} />
                      <span className="font-black text-2xl">:</span>
                      <input type="number" className="w-20 p-4 rounded-2xl border-none shadow-inner text-center font-black text-2xl text-black" value={scoreB} onChange={(e) => setScoreB(parseInt(e.target.value))} />
                      <button onClick={() => handleUpdateScore(game.id)} className="p-4 bg-[#0B0E14] text-white rounded-2xl hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all"><Save className="w-6 h-6" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black tabular-nums tracking-tighter">{game.score_team_a || 0} : {game.score_team_b || 0}</span>
                      <button onClick={() => { setEditingScoreId(game.id); setScoreA(game.score_team_a || 0); setScoreB(game.score_team_b || 0); }} className="text-xs font-black uppercase text-[#9EF01A] hover:underline underline-offset-4 decoration-2">Update Score</button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Link href={`/game/${game.id}`} className="flex-1 text-center py-5 bg-[#0B0E14] text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all">Session Details</Link>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/game/${game.id}`); toast.success("Invite Link Copied"); }} className="p-5 bg-gray-50 rounded-[20px] hover:bg-gray-100 transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
            {games.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold bg-gray-50 rounded-[48px] border-4 border-dashed border-gray-100">No community sessions found.</div>}
          </div>
        </section>

        {/* Booking & Slot Management */}
        <div className="bg-white rounded-[64px] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-12 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-black">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-2">Court Timeline</h2>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Live Inventory & Slot Management</p>
            </div>
            <input type="date" className="bg-white border-2 border-gray-100 p-4 rounded-2xl font-black text-black" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="overflow-x-auto text-black">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-10 border-b border-r border-gray-50 text-left bg-gray-50/50 text-[10px] font-black uppercase text-gray-300 tracking-widest">Time</th>
                  {courts.map(c => <th key={c.id} className="p-10 border-b border-gray-50 text-center font-black uppercase text-sm tracking-widest">{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {times.map(t => (
                  <tr key={t}>
                    <td className="p-10 border-b border-r border-gray-50 font-black text-gray-400 text-sm bg-gray-50/10">{t}</td>
                    {courts.map(c => {
                      const isOpenPlay = games.find(g => g.court_id === c.id && new Date(g.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) === t);
                      const booking = bookings.find(b => b.court_id === c.id && new Date(b.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) === t);
                      return (
                        <td key={`${c.id}-${t}`} className="p-6 border-b border-gray-50">
                          {isOpenPlay ? (
                            <div className="bg-[#9EF01A]/10 text-[#0B0E14] py-8 rounded-[32px] text-[10px] font-black uppercase tracking-widest text-center border-2 border-[#9EF01A]/30">Open Play</div>
                          ) : booking ? (
                            <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex flex-col items-center gap-3">
                              <span className="text-[10px] font-black uppercase text-gray-300">Reserved by</span>
                              <span className="font-black text-xs uppercase truncate max-w-[120px]">{booking.user_id}</span>
                              {isManager && <button onClick={() => handleCancelBooking(booking.id)} className="text-red-400 hover:text-red-600 transition-colors"><XCircle className="w-4 h-4" /></button>}
                            </div>
                          ) : (
                            <button onClick={() => handleBooking(c.id, t)} disabled={isManager} className={`w-full py-10 rounded-[32px] border-2 border-dashed border-gray-100 text-gray-200 text-[10px] font-black uppercase hover:border-[#9EF01A] hover:bg-[#9EF01A]/5 hover:text-[#0B0E14] transition-all disabled:opacity-50`}>Available</button>
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
    </div>
  );
}

export default function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>}><FacilityDetailContent params={params} /></Suspense>;
}
