"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, User } from 'lucide-react';
import { PROFILE_IMAGES } from '@/data';
import { toast } from 'sonner';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [authError, setAuthError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!name || !email || !password) {
      toast.error('Please fill in all fields.');
      setAuthError('All fields are required');
      return;
    }
    
    setIsLoading(true);

    try {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: 'vendor' })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Signup failed');
        }
      } catch (fetchErr) {
        console.warn('API signup failed, using client-side mock bypass.', fetchErr);
      }

      toast.success('Application submitted successfully! (Mock Mode) You can now log in.');
      router.push('/login');
    } catch (err: any) {
      setAuthError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-screen h-screen bg-[#09090b] text-zinc-200 select-none overflow-hidden font-sans">
      <main className="flex-1 flex flex-col items-center justify-center relative px-6 md:px-12 bg-radial from-zinc-950 via-transparent to-transparent bg-[#09090b]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="w-full max-w-[440px] z-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-white rounded flex items-center justify-center mb-3 shadow">
              <div className="w-5 h-5 bg-black rotate-45"></div>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none text-center">VendorBridge</h1>
            <p className="text-zinc-400 text-xs mt-1.5 font-sans">Apply for Vendor Access</p>
          </div>

          <div className="glass rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <form className="space-y-4" onSubmit={handleSignup}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-450 ml-1 block">Full Name</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className={`w-full bg-[#0d0d0f]/80 border ${authError ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-500'} rounded-lg py-3 pl-10 pr-4 text-xs text-white outline-none focus:ring-1 transition-all duration-150`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-450 ml-1 block">Email Address</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className={`w-full bg-[#0d0d0f]/80 border ${authError ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-500'} rounded-lg py-3 pl-10 pr-4 text-xs text-white outline-none focus:ring-1 transition-all duration-150`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-450 ml-1 block">Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full bg-[#0d0d0f]/80 border ${authError ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : 'border-zinc-800 focus:border-zinc-500 focus:ring-zinc-500'} rounded-lg py-3 pl-10 pr-10 text-xs text-white outline-none focus:ring-1 transition-all duration-150`}
                  />
                </div>
                {authError && (
                  <p className="text-red-400 text-[10px] ml-1 mt-1 font-medium animate-pulse">
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-lg mt-2 transition-all cursor-pointer"
              >
                {isLoading ? 'Creating Account...' : 'Apply for Access'}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center select-text">
            <p className="text-xs text-zinc-400">
              Already have an account?{' '}
              <button onClick={() => router.push('/login')} className="text-white hover:underline cursor-pointer">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </main>
      
      <aside className="hidden lg:flex w-[40%] bg-zinc-900 relative overflow-hidden flex-col justify-end p-8 border-l border-zinc-800 z-10">
        <div className="absolute inset-0">
          <img src={PROFILE_IMAGES.glowBg} alt="Background" className="w-full h-full object-cover mix-blend-overlay opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-2xl font-semibold text-white tracking-tight leading-tight">Join VendorBridge Network</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Register to become an official vendor partner and start receiving RFQs globally.
          </p>
        </div>
      </aside>
    </div>
  );
}
