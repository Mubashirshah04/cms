
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Service } from '../types';
import { SERVICES } from '../constants/services';
import { ArrowRight, Sparkles, CheckCircle2, Star, ShieldCheck, Clock, RefreshCcw } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  // Start with local constants for "Instant" feel
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setIsSyncing(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (!error && data && data.length > 0) {
          setServices(data);
        }
      } catch (e) {
        console.warn("Supabase sync failed, using local clinical menu.");
      } finally {
        setIsSyncing(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="space-y-20 py-16 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border border-indigo-100 shadow-sm">
          <Sparkles className="w-4 h-4" /> Master-Level Therapeutics
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
          Curated <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-500">Wellness Menu</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Select from our elite range of clinical treatments. Each session is personalized to your unique physiological requirements.
        </p>
      </div>

      {/* High-End Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
        {services.map((service, index) => (
          <div 
            key={service.id}
            className="group bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 hover:shadow-indigo-200/50 transition-all duration-700 overflow-hidden flex flex-col transform hover:-translate-y-2"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-10 space-y-8 flex-1">
              <div className="flex justify-between items-start">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-inner group-hover:rotate-6">
                  {service.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{service.price}</div>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{service.duration}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 space-y-3">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Clinical Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {(service.benefits || []).map((benefit, i) => (
                    <div key={i} className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-600 rounded-full border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/?service=${service.id}`)}
              className="w-full py-8 bg-slate-900 text-white group-hover:bg-indigo-600 transition-all font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3"
            >
              Secure This Session <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Clinical Standards Section */}
      <div className="bg-slate-900 rounded-[4rem] p-16 md:p-24 text-white relative overflow-hidden mx-4 shadow-3xl">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] -ml-40 -mt-40"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-black tracking-tighter leading-none">
              The Serenity <br/> <span className="text-indigo-400">Clinical Protocol</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
              Every practitioner at Serenity undergoes a rigorous selection process, ensuring you receive only master-level therapeutic care.
            </p>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest">
                100% Licensed Staff
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest">
                Safe & Private
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <StandardItem icon={<ShieldCheck className="w-8 h-8"/>} title="Safety" desc="Sterilized clinical environments." />
            <StandardItem icon={<Star className="w-8 h-8"/>} title="Excellence" desc="Voted top clinic in 2024." />
            <StandardItem icon={<Clock className="w-8 h-8"/>} title="Prompt" desc="Zero wait-time policy." />
            <StandardItem icon={<Sparkles className="w-8 h-8"/>} title="Tailored" desc="AI-driven treatment plans." />
          </div>
        </div>
      </div>
    </div>
  );
};

const StandardItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all">
    <div className="text-indigo-400 mb-4">{icon}</div>
    <h4 className="font-black text-xl mb-2">{title}</h4>
    <p className="text-slate-500 text-sm font-medium leading-tight">{desc}</p>
  </div>
);

export default ServicesPage;
