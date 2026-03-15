"use client";

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getGames,
  joinGame,
  getParticipants,
  updateGameScore,
  User,
  Game,
  SkillLevel
} from '../../api/index';
import toast from 'react-hot-toast';
import { 
  ChevronLeft, 
  Users, 
  Clock, 
  Calendar as CalendarIcon,
  Loader2,
  Share2,
  CheckCircle2,
  Trophy,
  Save,
  MessageCircle
} from 'lucide-react';

function GameJoinContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Scoring
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const fetchData = async () => {
    try {
      const [gRes, pRes] = await Promise.all([
        getGames(),
        getParticipants(gameId)
      ]);
      const foundGame = gRes.data.find(g => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);
        setScoreA(foundGame.score_team_a || 0);
        setScoreB(foundGame.score_team_b || 0);
      }
      setParticipants(pRes.data);
    } catch (err) {
      toast.error("Game session not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient) fetchData();
  }, [isClient, gameId]);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please login to join.");
      router.push('/login');
      return;
    }
    try {
      await joinGame(gameId, user.id);
      toast.success("Joined successfully!");
      fetchData();
    } catch (err) {
      toast.error("Failed to join session.");
    }
  };

  const handleUpdateScore = async () => {
    try {
      await updateGameScore(gameId, scoreA, scoreB);
      toast.success("Scores updated!");
      setIsEditingScore(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to update scores.");
    }
  };

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;
  if (!game) return <div className="p-20 text-center font-bold text-black">Session not found.</div>;

  const isAlreadyIn = participants.some(p => p.id === user?.id);
  const isFull = participants.length >= game.max_players;
  const canUpdateScore = isAlreadyIn || user?.role === 'Manager';

  return (
    <div className="min-h-screen bg-white text-[#0B0E14]">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#0B0E14]">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#9EF01A]/10 text-[#9EF01A] rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                Open Play Session
              </div>
              <h1 className="text-7xl font-black tracking-tighter uppercase mb-8 leading-none">{game.title}</h1>
              <div className="flex flex-wrap gap-8 text-gray-400 font-bold">
                <div className="flex items-center gap-2 uppercase text-xs tracking-widest"><CalendarIcon className="w-5 h-5 text-[#9EF01A]" /> {new Date(game.start_time).toLocaleDateString()}</div>
                <div className="flex items-center gap-2 uppercase text-xs tracking-widest"><Clock className="w-5 h-5 text-[#9EF01A]" /> {new Date(game.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                <div className="flex items-center gap-2 uppercase text-xs tracking-widest"><Users className="w-5 h-5 text-[#9EF01A]" /> {participants.length}/{game.max_players} Players</div>
              </div>
            </div>

            {/* Participants Card */}
            <div className="bg-gray-50 rounded-[48px] p-10 border border-gray-100 shadow-sm mb-12">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Court Roster</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12 text-black">
                {participants.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#9EF01A] rounded-full flex items-center justify-center font-black text-sm uppercase">{(p.display_name || p.id)[0]}</div>
                    <span className="font-black text-sm uppercase truncate">{p.display_name || p.id}</span>
                  </div>
                ))}
                {participants.length === 0 && <p className="col-span-full text-gray-400 font-medium italic">No players have joined yet.</p>}
              </div>

              {!isAlreadyIn && (
                <button 
                  onClick={handleJoin}
                  disabled={isFull}
                  className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest transition-all ${isFull ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0B0E14] text-white hover:bg-[#9EF01A] hover:text-[#0B0E14] shadow-xl shadow-black/10'}`}
                >
                  {isFull ? "Session Full" : "Join the Game"}
                </button>
              )}
              {isAlreadyIn && (
                <div className="flex items-center justify-center gap-3 w-full py-6 bg-[#9EF01A]/10 text-[#0B0E14] rounded-3xl font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-6 h-6 text-[#9EF01A]" /> You are registered
                </div>
              )}
            </div>
          </div>

          {/* Scoring Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#0B0E14] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#9EF01A]">Match Score</h3>
                  <Trophy className={`w-6 h-6 ${game.is_finished ? 'text-amber-400' : 'text-white/20'}`} />
                </div>

                {isEditingScore ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-center flex-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block">Team A</label>
                        <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-center text-4xl font-black text-white outline-none focus:ring-2 focus:ring-[#9EF01A]" value={scoreA} onChange={(e) => setScoreA(parseInt(e.target.value))} />
                      </div>
                      <span className="text-2xl font-black text-white/20 mt-6">:</span>
                      <div className="text-center flex-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block text-gray-500">Team B</label>
                        <input type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-center text-4xl font-black text-white outline-none focus:ring-2 focus:ring-[#9EF01A]" value={scoreB} onChange={(e) => setScoreB(parseInt(e.target.value))} />
                      </div>
                    </div>
                    <button onClick={handleUpdateScore} className="w-full py-4 bg-[#9EF01A] text-[#0B0E14] rounded-2xl font-black uppercase tracking-widest text-xs">Save Results</button>
                    <button onClick={() => setIsEditingScore(false)} className="w-full text-center text-xs font-black uppercase text-gray-500 tracking-widest">Cancel</button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-8 mb-10">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Team A</p>
                        <p className="text-6xl font-black tabular-nums">{game.score_team_a || 0}</p>
                      </div>
                      <span className="text-4xl font-black text-white/10">:</span>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Team B</p>
                        <p className="text-6xl font-black tabular-nums">{game.score_team_b || 0}</p>
                      </div>
                    </div>
                    {canUpdateScore && (
                      <button onClick={() => setIsEditingScore(true)} className="flex items-center gap-2 mx-auto px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-[#9EF01A] hover:bg-white/5 transition-colors">
                        Update Score
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9EF01A]/5 rounded-full blur-3xl" />
            </div>

            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Invite link copied!"); }} className="flex items-center justify-center gap-3 w-full py-6 bg-gray-50 rounded-[32px] font-black uppercase tracking-widest text-xs hover:bg-[#0B0E14] hover:text-white transition-all text-black">
              <Share2 className="w-4 h-4" /> Share Invite
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function GameJoinPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense><GameJoinContent params={params} /></Suspense>;
}
