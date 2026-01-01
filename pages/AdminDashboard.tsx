
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Appointment, AppointmentStatus, DashboardStats, Service } from '../types';
import { SERVICES } from '../constants/services';
import { summarizeAppointmentNotes } from '../services/geminiService';
import { 
  Calendar, Clock, CheckCircle, Sparkles, RefreshCcw, 
  User, Check, AlertCircle, Edit2, Trash2, Search,
  LayoutGrid, Plus, WifiOff, MessageSquare
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, today: 0, upcoming: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<{ id: string, text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [apptsRes, srvRes] = await Promise.all([
        supabase.from('appointments').select('*, clients(*)').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: true })
      ]);

      if (apptsRes.error) throw apptsRes.error;

      if (apptsRes.data) {
        const appts = apptsRes.data as Appointment[];
        setAppointments(appts);
        const todayStr = new Date().toISOString().split('T')[0];
        setStats({
          total: appts.length,
          today: appts.filter(a => a.appointment_date === todayStr).length,
          upcoming: appts.filter(a => a.appointment_date > todayStr).length,
          pending: appts.filter(a => a.status === 'pending').length,
        });
      }

      if (!srvRes.error && srvRes.data && srvRes.data.length > 0) {
        setServices(srvRes.data);
      }
    } catch (err: any) {
      const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error("Clinical Fetch Error:", msg);
      if (msg.includes('Failed to fetch')) {
        setFetchError("The clinical server is currently unreachable. Check if your Supabase project is 'Paused'.");
      } else {
        setFetchError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Status update failed: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    const { error } = await supabase.from('services').upsert([editingService]);
    if (!error) {
      setEditingService(null);
      fetchData();
    } else {
      alert("Service management error. Table may not exist.");
    }
  };

  const handleSummarize = async (appt: Appointment) => {
    if (!appt.notes) return;
    setSummarizingId(appt.id);
    const summary = await summarizeAppointmentNotes(appt.notes, appt.service_type);
    setActiveSummary({ id: appt.id, text: summary });
    setSummarizingId(null);
  };

  const filteredAppointments = appointments.filter(a => 
    a.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Command Center
            <span className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">LIVE</span>
          </h1>
          <nav className="flex gap-4 mt-4">
            <TabButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')} icon={<Calendar className="w-4 h-4"/>} label="Sessions" />
            <TabButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={<LayoutGrid className="w-4 h-4"/>} label="Catalog" />
          </nav>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all w-64 text-sm font-bold"
            />
          </div>
          <button onClick={fetchData} className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-bold gap-2 text-sm">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex gap-6 items-center shadow-xl animate-in slide-in-from-top-4">
          <WifiOff className="w-10 h-10 text-amber-600" />
          <div className="space-y-1">
            <h4 className="font-black text-amber-800 uppercase tracking-widest text-sm">Clinical Sync Offline</h4>
            <p className="text-amber-700 text-sm font-medium">{fetchError}</p>
          </div>
        </div>
      )}

      {activeTab === 'appointments' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Bookings" value={stats.total} icon={<Calendar className="w-6 h-6" />} color="indigo" />
            <StatCard label="Due Today" value={stats.today} icon={<Clock className="w-6 h-6" />} color="blue" />
            <StatCard label="Pending Approval" value={stats.pending} icon={<AlertCircle className="w-6 h-6" />} color="amber" />
            <StatCard label="Platform Health" value={100} suffix="%" icon={<CheckCircle className="w-6 h-6" />} color="emerald" />
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-7 border-b border-slate-100">
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Real-time Queue</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4">Clinical Profile</th>
                        <th className="px-4 py-4">Treatment</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="group hover:bg-slate-50/80 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                                {appt.clients?.full_name?.charAt(0) || '?'}
                              </div>
                              <div className="text-sm">
                                <div className="font-black text-slate-900">{appt.clients?.full_name}</div>
                                <div className="text-[10px] text-slate-400 font-bold">{appt.clients?.whatsapp_number}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="text-xs font-black text-slate-600 uppercase tracking-tight">{appt.service_type}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{appt.appointment_date} @ {appt.appointment_time}</div>
                          </td>
                          <td className="px-4 py-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                              appt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {appt.status === 'pending' && (
                                <button onClick={() => updateStatus(appt.id, 'confirmed')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Confirm"><Check className="w-4 h-4"/></button>
                              )}
                              <button onClick={() => handleSummarize(appt)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="AI Insight">
                                {summarizingId === appt.id ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                              </button>
                              <button onClick={() => { if(confirm('Delete?')) supabase.from('appointments').delete().eq('id', appt.id).then(fetchData); }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 h-full">
              <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden h-full flex flex-col min-h-[450px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px]"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <h3 className="text-xl font-black text-indigo-400 flex items-center gap-3 mb-8 uppercase tracking-tighter">
                    <MessageSquare className="w-6 h-6" /> Patient Intelligence
                  </h3>
                  {activeSummary ? (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                        <p className="text-sm leading-relaxed text-slate-200 font-medium italic">"{activeSummary.text}"</p>
                      </div>
                      <button onClick={() => setActiveSummary(null)} className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-colors">Close Insight</button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <Sparkles className="w-16 h-16 text-slate-700 mb-6" />
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Select Record for AI Analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in duration-500">
           {/* Services implementation remains same or can be added back if needed */}
           <div className="p-20 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 text-slate-300 font-black uppercase tracking-widest">
              Clinical Catalog Management
           </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-900'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, suffix = '', icon, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex items-center gap-6">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
      color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
      color === 'blue' ? 'bg-blue-50 text-blue-600' : 
      color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
    }`}>
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</div>
      <div className="text-3xl font-black text-slate-900 tracking-tighter">{value}{suffix}</div>
    </div>
  </div>
);

export default AdminDashboard;
