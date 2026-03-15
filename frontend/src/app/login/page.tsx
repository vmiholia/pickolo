"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../api/index';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      const res = await login(userId);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success(`Welcome back, ${res.data.id}!`);
      router.push('/');
      setTimeout(() => window.location.reload(), 100); // Ensure header updates
    } catch (err) {
      toast.error("Login failed. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#9EF01A] rounded-2xl flex items-center justify-center font-black text-2xl text-[#0B0E14] mx-auto mb-4">
            P
          </div>
          <h1 className="text-3xl font-black text-[#0B0E14]">Welcome to Pickolo</h1>
          <p className="text-gray-500 mt-2">Enter your User ID to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">User ID</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#9EF01A]/20 focus:border-[#9EF01A] outline-none transition-all text-black"
              placeholder="e.g. player1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0B0E14] text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8 leading-relaxed">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
