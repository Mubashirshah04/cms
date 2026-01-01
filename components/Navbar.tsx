
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogOut, LayoutDashboard, Calendar, Sparkles, Menu } from 'lucide-react';

interface NavbarProps {
  session: any | null;
}

const Navbar: React.FC<NavbarProps> = ({ session }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await (supabase.auth as any).signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-900 leading-none">SERENITY</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Clinical Pro</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/services" 
            className={`text-sm font-black uppercase tracking-widest transition-colors ${isActive('/services') ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
          >
            Clinical Menu
          </Link>
          <Link 
            to="/" 
            className={`text-sm font-black uppercase tracking-widest transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
          >
            Secure Booking
          </Link>
          
          <div className="h-6 w-px bg-slate-100 mx-2"></div>

          {session ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                <LayoutDashboard className="w-4 h-4" /> Command Center
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2.5 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/admin/login" 
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              Staff Access <LayoutDashboard className="w-4 h-4 opacity-50" />
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 text-slate-900">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;