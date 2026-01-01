
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, WifiOff, ShieldAlert, Zap } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; type: 'auth' | 'network' | 'unknown' } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError({ message: authError.message, type: 'auth' });
      } else if (data?.session) {
        // Instant navigation on success
        navigate('/admin');
      }
    } catch (err: any) {
      console.error("Login Exception:", err);
      if (err.message?.includes('Failed to fetch') || err.message?.includes('network')) {
        setError({ 
          message: "The clinical server is unreachable. Check if your Supabase project is 'Paused' in the dashboard.", 
          type: 'network' 
        });
      } else {
        setError({ message: err.message || "Authentication service error.", type: 'unknown' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in duration-500 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-indigo-100 animate-pulse">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Staff Access</h1>
          <p className="text-slate-500 font-medium">Securing clinical data with real-time auth</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-3xl border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                Professional Email
              </label>
              <input 
                required
                type="email" 
                placeholder="therapist@serenity.com"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                Secure Password
              </label>
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className={`p-6 rounded-2xl text-xs font-bold border animate-in slide-in-from-top-4 duration-500 ${
                error.type === 'network' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                <div className="flex gap-4">
                  {error.type === 'network' ? <WifiOff className="w-6 h-6 flex-shrink-0" /> : <ShieldAlert className="w-6 h-6 flex-shrink-0" />}
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-widest">{error.type === 'network' ? 'Connection Blocked' : 'Access Error'}</p>
                    <p className="font-medium opacity-90 leading-relaxed">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Unlock Dashboard <ArrowRight className="w-6 h-6" /></>
              )}
            </button>
          </form>
<div className="mt-8 text-center">
  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
    Demo Admin Credentials
  </p>
  <p className="text-sm font-mono text-slate-600">
    Email: <span className="font-bold">admin@demo.com</span><br />
    Password: <span className="font-bold">admin123</span>
  </p>
</div>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em] leading-relaxed">
              Proprietary Clinical System • ISO 27001 Certified<br/>
              Identity protected by Supabase Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
