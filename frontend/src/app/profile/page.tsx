"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, SkillLevel, updateUser, getUserSchedule, UserSchedule } from '../api/index';
import toast from 'react-hot-toast';
import { 
  Trophy, 
  Flame, 
  TrendingUp, 
  ChevronRight,
  Loader2,
  Award,
  Clock,
  User as UserIcon,
  Edit2
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [schedule, setSchedule] = useState<UserSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('user');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);
      setNewName(parsedUser.display_name || parsedUser.id);
      fetchData(parsedUser.id);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchData = async (userId: string) => {
    try {
      const sRes = await getUserSchedule(userId);
      setSchedule(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async (level: SkillLevel) => {
    if (!user) return;
    try {
      const res = await updateUser(user.id, { skill_level: level });
      const updatedUser = { ...user, skill_level: res.data.skill_level };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(`Skill level updated to ${level}`);
    } catch (err) {
      toast.error("Failed to update skill level.");
    }
  };

  const handleUpdateName = async () => {
    if (!user || !newName) return;
    try {
      const res = await updateUser(user.id, { display_name: newName });
      // Critical: Update local state AND localStorage
      const updatedUser = { ...user, display_name: res.data.display_name };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingName(false);
      toast.success("Display name updated!");
      // Force a re-render or notification to header
      window.dispatchEvent(new Event('storage')); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to update name.");
    }
  };

  if (!isClient || loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-12 h-12 animate-spin text-[#9EF01A]" /></div>;

  const winRate = user?.wins !== undefined && user?.losses !== undefined && (user.wins + user.losses) > 0 
    ? Math.round((user.wins / (user.wins + user.losses)) * 100) 
    : 0;

  const displayName = user?.display_name || user?.id;

  return (
    <div className="min-h-screen bg-white text-[#0B0E14] py-12">
      <main className="max-w-5xl mx-auto px-4 text-black">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-[#0B0E14] text-white rounded-[40px] p-8 mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-[#9EF01A] rounded-3xl flex items-center justify-center font-black text-3xl text-[#0B0E14] mb-6 shadow-xl">
                  {displayName[0].toUpperCase()}
                </div>
                
                {isEditingName ? (
                  <div className="mb-4">
                    <input 
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-2 text-white font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-[#9EF01A]"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={handleUpdateName} className="text-[10px] font-black uppercase text-[#9EF01A]">Save</button>
                      <button onClick={() => setIsEditingName(false)} className="text-[10px] font-black uppercase text-gray-400">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group mb-2">
                    <h1 className="text-3xl font-black uppercase tracking-tight truncate">{displayName}</h1>
                    <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-[#9EF01A]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <p className="text-gray-400 font-bold text-sm mb-8">{user?.role} Profile</p>
                
                {user?.role !== 'Manager' && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#9EF01A]">Global Ranking</p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black leading-none">#124</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {user?.role !== 'Manager' && (
              <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Manage Skill Level</h3>
                <div className="space-y-3">
                  {Object.values(SkillLevel).map((level) => (
                    <button
                      key={level}
                      onClick={() => handleUpdateSkill(level)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all border ${
                        user?.skill_level === level 
                          ? "bg-white border-[#9EF01A] text-[#0B0E14] shadow-sm" 
                          : "bg-transparent border-transparent text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {level}
                      {user?.skill_level === level && <Award className="w-4 h-4 text-[#9EF01A]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-12">
            {user?.role !== 'Manager' ? (
              <>
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Points</p>
                    <p className="text-3xl font-black">{user?.points || 0}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Wins</p>
                    <p className="text-3xl font-black text-[#9EF01A]">{user?.wins || 0}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Losses</p>
                    <p className="text-3xl font-black text-red-400">{user?.losses || 0}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Win Rate</p>
                    <p className="text-3xl font-black text-blue-400">{winRate}%</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Flame className="text-[#9EF01A]" /> Recent Match History
                  </h2>
                  <div className="space-y-4">
                    {schedule?.games.map(game => (
                      <div key={game.id} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex justify-between items-center hover:bg-white hover:shadow-xl transition-all group">
                        <div>
                          <p className="text-xs font-black text-[#9EF01A] uppercase mb-1">{game.skill_level}</p>
                          <h4 className="font-black text-lg uppercase">{game.title}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-gray-400">Score</p>
                          <p className="text-xl font-black">{game.score_team_a || 0} - {game.score_team_b || 0}</p>
                        </div>
                      </div>
                    ))}
                    {(!schedule?.games || schedule.games.length === 0) && <p className="text-gray-400 italic">No matches played yet.</p>}
                  </div>
                </section>
              </>
            ) : (
              <div className="bg-gray-50 p-12 rounded-[48px] border border-gray-100 text-center">
                <Trophy className="w-12 h-12 text-[#9EF01A] mx-auto mb-6" />
                <h2 className="text-3xl font-black uppercase mb-4">Venue Manager</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">Managers manage venues and sessions. View your analytics and facility performance in the Analytics tab.</p>
                <Link href="/schedule" className="px-8 py-4 bg-[#0B0E14] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#9EF01A] hover:text-[#0B0E14] transition-all">Go to Analytics</Link>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
