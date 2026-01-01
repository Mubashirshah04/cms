
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Service } from '../types';
import { SERVICES } from '../constants/services';
import { Sparkles, Calendar, Clock, User, Phone, Mail, MessageSquare, Check, XCircle, ChevronRight, ShieldCheck, AlertCircle, RefreshCcw } from 'lucide-react';

const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [services] = useState<Service[]>(SERVICES);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    serviceType: 'swedish',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && services.find(s => s.id === serviceParam)) {
      setFormData(prev => ({ ...prev, serviceType: serviceParam }));
    }
  }, [searchParams, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Insert Client Record
      const { data: client, error: clientErr } = await supabase
        .from('clients')
        .insert([{ 
          full_name: formData.fullName, 
          email: formData.email, 
          whatsapp_number: formData.whatsapp 
        }])
        .select()
        .single();

      if (clientErr) throw clientErr;

      // 2. Insert Appointment Record Linked to Client
      const { error: apptErr } = await supabase
        .from('appointments')
        .insert([{
          client_id: client.id,
          service_type: formData.serviceType,
          appointment_date: formData.date,
          appointment_time: formData.time,
          notes: formData.notes,
          status: 'pending'
        }]);

      if (apptErr) throw apptErr;

      // 3. If everything succeeded, show the success screen
      setSuccess(true);
      console.log("✅ Booking successfully committed to database.");

    } catch (err: any) {
      // Solve the [object Object] issue by extracting the message or stringifying
      const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error("❌ Database Write Failed:", errorMsg);
      
      if (errorMsg.includes('Failed to fetch')) {
        setError("Network connection failed. This usually means the clinical server is unreachable or the project is paused.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceType);

  if (success) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center p-20 bg-white rounded-[4rem] shadow-3xl border border-emerald-100 animate-in zoom-in-95 duration-700">
        <div className="w-36 h-36 bg-emerald-50 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Check className="w-20 h-20 text-emerald-600" />
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">Booking Confirmed</h2>
        <p className="text-xl text-slate-500 mb-14 leading-relaxed font-medium">
          Your <span className="text-indigo-600 font-black">{selectedService?.name}</span> session is securely registered. 
          The clinic will contact you via WhatsApp shortly.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-16 py-6 bg-slate-900 text-white rounded-3xl font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto"
        >
          Return to Portal <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-20 items-start py-16 px-4 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="lg:col-span-5 space-y-16 lg:sticky lg:top-32">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border border-indigo-100">
            <ShieldCheck className="w-4 h-4" /> SECURE INTAKE PORTAL
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
            Instant <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600">Recovery</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-sm">
            Please fill out the clinical intake form. Your data is sent directly to our secure database.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Assigned Treatment</h3>
          <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white flex items-center justify-between group relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-[60px] rounded-full"></div>
            <div className="relative z-10 flex items-center gap-8 w-full">
              <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-white/5">
                {selectedService?.icon || '🌿'}
              </div>
              <div className="flex-1">
                <select 
                  className="bg-transparent text-3xl font-black tracking-tight outline-none w-full appearance-none cursor-pointer"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id} className="text-slate-900 text-base">{s.name}</option>
                  ))}
                </select>
                <div className="text-indigo-400 font-black text-xs uppercase tracking-widest mt-1 flex items-center gap-3">
                  {selectedService?.duration} <span className="w-1 h-1 bg-indigo-400 rounded-full"></span> {selectedService?.price}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="bg-white p-12 md:p-16 rounded-[4rem] shadow-3xl border border-slate-100 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
            <div className="grid md:grid-cols-2 gap-10">
              <InputField label="Full Clinical Name" icon={<User className="w-3 h-3"/>} placeholder="Johnathan Doe" value={formData.fullName} onChange={(e: any) => setFormData({...formData, fullName: e.target.value})} />
              <InputField label="WhatsApp Identification" icon={<Phone className="w-3 h-3"/>} placeholder="+44 7700 900000" value={formData.whatsapp} onChange={(e: any) => setFormData({...formData, whatsapp: e.target.value})} />
            </div>

            <InputField label="Professional Email" icon={<Mail className="w-3 h-3"/>} placeholder="john@email.com" type="email" value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})} />

            <div className="grid md:grid-cols-2 gap-10">
              <InputField label="Appointment Date" icon={<Calendar className="w-3 h-3"/>} type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={(e: any) => setFormData({...formData, date: e.target.value})} />
              <InputField label="Appointment Time" icon={<Clock className="w-3 h-3"/>} type="time" value={formData.time} onChange={(e: any) => setFormData({...formData, time: e.target.value})} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-indigo-500" /> Focus Areas
              </label>
              <textarea required className="w-full px-8 py-7 rounded-[2.5rem] bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900 min-h-[160px] text-lg placeholder:text-slate-300" placeholder="Describe any chronic tension..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>

            {error && (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 animate-in slide-in-from-top-2">
                <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Submission Error</p>
                  <p className="text-sm text-rose-500 font-medium leading-relaxed">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-[10px] font-black text-rose-700 uppercase tracking-widest mt-2 hover:underline">Dismiss</button>
                </div>
              </div>
            )}

            <button disabled={submitting} type="submit" className="w-full bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-5 shadow-2xl disabled:opacity-50 transform active:scale-95">
              {submitting ? (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg">Transmitting Data...</span>
                </div>
              ) : (
                <>Secure Booking Now <ChevronRight className="w-8 h-8" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, icon, placeholder, value, onChange, type = "text", min }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 flex items-center gap-2">
      <span className="text-indigo-500">{icon}</span> {label}
    </label>
    <input required type={type} min={min} placeholder={placeholder} className="w-full px-8 py-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-black text-slate-900 text-lg placeholder:text-slate-300" value={value} onChange={onChange} />
  </div>
);

export default BookingPage;
