
import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, EsalData, Descent } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';
import RecitationCharts from './components/RecitationCharts';
import LandingView from './components/LandingView';
import { getSpiritualInsight } from './services/geminiService';
import { logger } from './services/logger';
import { apiService } from './services/apiService';

const USER_KEY = 'esal_user_name';
const VIEW_KEY = 'esal_view_mode';
const FAMILY_KEY = 'esal_current_family';

const POLLING_FAST = 5000;
const POLLING_SLOW = 20000;

const FAMILY_NAMES = [
  "Mussarat Parveen", "Muhammad Faisal", "Rabia Liaqat", "Yasir Liaqat",
  "Fatima Liaqat", "Madiha Liaqat", "Afshan Faisal", "Nageen Yasir",
  "Saeed Latif", "Ahsan Ellahi", "Numaira Saeed", "Humna Saeed",
  "Taha Saeed", "Haleema Fasial", "Ahmed Faisal", "Ibraheem Yasir",
  "Mustafa Yasir", "Ali Yasir", "Abdul Hadi", "Anabia Yasir", "Abdullah Ahsan"
];

const App: React.FC = () => {
  const [currentFamily, setCurrentFamily] = useState<Descent | null>(() => {
    const saved = localStorage.getItem(FAMILY_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_KEY) || '');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') || 'grid'
  );
  
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'collective' | 'personal' | 'connecting' | 'unavailable'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("Bismillah. Your collective prayers are a gift that transcends this world.");
  
  const isCollective = syncStatus === 'collective';

  const anniversaryInfo = useMemo(() => {
    if (!currentFamily?.passedDate) return null;
    try {
      const passed = new Date(currentFamily.passedDate);
      if (isNaN(passed.getTime())) return null;
      
      const today = new Date();
      const currentToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const currentYear = today.getFullYear();
      
      let next = new Date(currentYear, passed.getMonth(), passed.getDate());
      if (next < currentToday) {
        next = new Date(currentYear + 1, passed.getMonth(), passed.getDate());
      }
      
      const diff = next.getTime() - currentToday.getTime();
      const days = Math.ceil(diff / (1000 * 3600 * 24));
      const isToday = today.getMonth() === passed.getMonth() && today.getDate() === passed.getDate();
      
      return { days, isToday, dateLabel: passed.toLocaleDateString([], { day: 'numeric', month: 'long' }) };
    } catch (e) {
      return null;
    }
  }, [currentFamily]);

  const syncWithServer = async () => {
    if (!currentFamily) return;

    const statsResult = await apiService.getStats(currentFamily.id);
    if (statsResult && statsResult.error) {
      setSyncStatus('unavailable');
      setErrorMessage(statsResult.error);
      return;
    }

    const remoteContribs = await apiService.getContributions(currentFamily.id);
    if (statsResult && !statsResult.error && remoteContribs) {
      setGlobalStats(statsResult);
      setContributions(remoteContribs);
      setSyncStatus('collective');
      setErrorMessage(null);
    } else {
      if (syncStatus !== 'unavailable' && syncStatus !== 'personal') {
        setSyncStatus('personal');
      }
    }
  };

  useEffect(() => {
    if (currentFamily) {
      syncWithServer();
      const interval = setInterval(syncWithServer, isCollective ? POLLING_FAST : POLLING_SLOW);
      return () => clearInterval(interval);
    }
  }, [currentFamily, isCollective]);

  useEffect(() => { localStorage.setItem(USER_KEY, userName); }, [userName]);
  useEffect(() => { localStorage.setItem(VIEW_KEY, viewMode); }, [viewMode]);
  useEffect(() => {
    if (currentFamily) {
      localStorage.setItem(FAMILY_KEY, JSON.stringify(currentFamily));
    } else {
      localStorage.removeItem(FAMILY_KEY);
    }
  }, [currentFamily]);

  const handleAdd = async (type: RecitationType, count: number) => {
    const trimmedName = userName.trim();
    if (!trimmedName) {
      alert("Please enter your name first.");
      document.getElementById('user-name-input')?.focus();
      return;
    }

    if (!currentFamily) return;

    const newContrib: Contribution = {
      id: crypto.randomUUID(),
      family_id: currentFamily.id,
      contributorName: trimmedName,
      recitationType: type,
      count: count,
      timestamp: Date.now()
    };

    setLastAddedId(newContrib.id);
    setContributions(prev => [newContrib, ...prev]);

    const success = await apiService.postContribution(newContrib);
    if (success) syncWithServer();

    if (Math.random() > 0.7) {
      getSpiritualInsight(type).then(setAiInsight);
    }
    setTimeout(() => setLastAddedId(null), 2000);
  };

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    Object.values(RecitationType).forEach(t => {
      if (isCollective && globalStats) {
        const dbKey = `total_${t.replace(/\s+/g, '_')}`;
        map[t] = globalStats[dbKey] || 0;
      } else {
        map[t] = contributions
          .filter(c => c.recitationType === t)
          .reduce((sum, c) => sum + c.count, 0);
      }
    });
    return map;
  }, [globalStats, contributions, isCollective]);

  const grandTotal = isCollective ? (globalStats?.grandTotal || 0) : (Object.values(totals) as number[]).reduce((a: number, b: number) => a + b, 0);

  if (!currentFamily) {
    return <LandingView onSelectFamily={setCurrentFamily} />;
  }

  return (
    <div className="min-h-screen pb-12 px-3 sm:px-6 lg:px-8 pt-4 max-w-[1600px] mx-auto transition-all animate-in fade-in duration-700">
      {/* Sync Banner */}
      {syncStatus === 'unavailable' && (
        <div className="mb-4 bg-red-900/90 text-white rounded-2xl p-4 shadow-xl border border-red-700/50 flex items-center justify-between backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <i className="fas fa-triangle-exclamation text-red-400"></i>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">Sync Interrupted</p>
              <p className="text-xs font-medium leading-tight">Server Error: {errorMessage || "Unable to reach database"}. Contributions are currently personal.</p>
            </div>
          </div>
          <button onClick={() => syncWithServer()} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
            Retry Connection
          </button>
        </div>
      )}

      {/* Insight Banner */}
      <div className="mb-6 bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 relative overflow-hidden group">
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600 shrink-0">
            <i className="fas fa-lightbulb text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Spiritual Virtue</p>
            <p className="text-xs sm:text-sm font-medium text-slate-700 italic leading-relaxed">"{aiInsight}"</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8 bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border border-cyan-50 shadow-sm">
        <div className="text-center lg:text-left flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-2">
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black cyan-theme serif-font tracking-tight">Esal-e-Sawab</h1>
             <div className="flex bg-cyan-50 rounded-full p-1 border border-cyan-100">
                <button 
                    onClick={() => setCurrentFamily(null)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-cyan-600 px-6 py-2.5 rounded-full shadow-sm hover:bg-cyan-600 hover:text-white transition-all border border-cyan-100 group"
                >
                    <i className="fas fa-users-viewfinder group-hover:scale-110 transition-transform"></i>
                    Switch Family / Search
                </button>
             </div>
          </div>
          <div className="flex items-center gap-2 justify-center lg:justify-start ml-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isCollective ? 'bg-green-400 animate-pulse' : syncStatus === 'unavailable' ? 'bg-slate-400' : 'bg-orange-400'}`}></span>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
              {isCollective ? 'Collective Real-time Sync' : syncStatus === 'unavailable' ? 'Sync Unavailable' : 'Personal Mode'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-4 px-6 flex flex-col items-center min-w-[140px] shadow-cyan-500/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grand Total</span>
            <span className="text-cyan-500 font-black text-2xl sm:text-3xl leading-tight tabular-nums">{grandTotal.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 p-4 px-6 min-w-[240px] flex flex-col items-center lg:items-start shadow-cyan-500/5">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">In Loving Memory Of</p>
            <h2 className="serif-font text-2xl sm:text-3xl font-black text-slate-800 truncate tracking-wide flex items-baseline gap-2">
              {currentFamily.name} 
              <span className="text-cyan-400 text-sm font-black uppercase tracking-wider bg-cyan-50 px-2 py-0.5 rounded-md">{currentFamily.location}</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Anniversary Reminder */}
      {anniversaryInfo && (
        <div className={`mb-8 p-6 rounded-[2rem] border transition-all duration-700 ${anniversaryInfo.isToday ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 border-cyan-400 shadow-2xl shadow-cyan-500/20 text-white' : 'bg-white border-cyan-100 shadow-sm'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl shadow-inner ${anniversaryInfo.isToday ? 'bg-white/20' : 'bg-cyan-50 text-cyan-500'}`}>
                <i className="fas fa-calendar-star"></i>
              </div>
              <div>
                <h3 className={`text-xl font-black uppercase tracking-widest ${anniversaryInfo.isToday ? 'text-white' : 'text-slate-800'}`}>
                  {anniversaryInfo.isToday ? "Death Anniversary - Today" : "Death Anniversary Remembrance"}
                </h3>
                <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${anniversaryInfo.isToday ? 'text-cyan-50' : 'text-slate-400'}`}>
                  Observed on {anniversaryInfo.dateLabel}
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              {anniversaryInfo.isToday ? (
                <div className="px-8 py-3 bg-white rounded-full text-cyan-600 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse shadow-lg">
                  Special Day of Remembrance
                </div>
              ) : (
                <div className="flex flex-col items-center md:items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-cyan-500 tabular-nums">{anniversaryInfo.days}</span>
                    <span className="text-sm font-black text-cyan-500 uppercase">Days</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining Until Anniversary</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Input Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-5 border border-cyan-50 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-5 w-full max-w-lg">
          <div className="bg-white shadow-sm p-3.5 rounded-2xl text-cyan-500 border border-cyan-50 hidden sm:block shrink-0">
            <i className="fas fa-id-card text-base"></i>
          </div>
          <div className="flex-1 w-full">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">Participating Reciter</p>
            <input
              id="user-name-input"
              type="text"
              list="family-names"
              placeholder="Enter your name to contribute..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50/50 rounded-xl px-4 py-3 outline-none text-slate-700 font-bold text-sm focus:border-cyan-400 focus:bg-white border border-transparent transition-all shadow-inner"
            />
            <datalist id="family-names">
              {FAMILY_NAMES.map(name => <option key={name} value={name} />)}
            </datalist>
          </div>
        </div>
        <div className="flex bg-slate-100/50 rounded-2xl p-1.5 border border-slate-200/50 w-full md:w-auto">
          <button onClick={() => setViewMode('grid')} className={`flex-1 md:flex-none px-6 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fas fa-th-large mr-2"></i>Grid
          </button>
          <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-6 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fas fa-list mr-2"></i>List
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className={`grid gap-4 mb-10 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
        {RECITATIONS.map((rec) => (
          <RecitationCard key={rec.id} info={rec} totalCount={totals[rec.id] || 0} onAdd={(count) => handleAdd(rec.id, count)} isListView={viewMode === 'list'} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[2.5rem] border border-cyan-50 p-6 sm:p-10 shadow-sm max-w-6xl mx-auto mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50/50 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-800 uppercase tracking-widest">Recent Family Contributions</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live prayer activity feed</p>
          </div>
          <div className="text-right hidden sm:block">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isCollective ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
              {isCollective ? 'Live Streaming' : 'Local History'}
            </span>
          </div>
        </div>
        <div className="max-h-[450px] overflow-y-auto pr-3 custom-scrollbar no-scrollbar relative z-10">
          {contributions.length === 0 ? (
            <div className="text-center py-20 opacity-30 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-cyan-50 flex items-center justify-center mb-6">
                <i className="fas fa-dove text-4xl text-cyan-400"></i>
              </div>
              <p className="text-slate-500 text-sm italic font-medium">No activity yet. Start reciting to honor your loved one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.slice(0, 50).map((c) => (
                <div key={c.id} className={`flex justify-between items-center p-4 px-6 rounded-2xl bg-slate-50/50 border border-transparent transition-all hover:bg-white hover:border-cyan-100 hover:shadow-sm ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200 shadow-md ring-2 ring-cyan-500/20' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${lastAddedId === c.id ? 'bg-cyan-500 text-white border-cyan-400 rotate-12 scale-110' : 'bg-white text-slate-300 border-slate-100'}`}>
                      <i className="fas fa-heart text-xs"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none mb-1.5">{c.contributorName}</p>
                      <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.15em]">{c.recitationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-500 font-black text-lg sm:text-xl tabular-nums">+{c.count.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap mt-0.5">
                      {new Date(c.timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })} • {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RecitationCharts contributions={contributions} />

      <footer className="text-center py-16 mt-16 border-t border-slate-100/60 max-w-xl mx-auto">
        <div className="flex justify-center gap-6 mb-8 text-slate-300">
           <i className="fas fa-star text-xs"></i>
           <i className="fas fa-heart text-xs"></i>
           <i className="fas fa-star text-xs"></i>
        </div>
        <p className="text-[10px] uppercase font-black tracking-[0.6em] text-slate-400 leading-relaxed mb-4">Esal-e-Sawab Platform • Sadaqah Jariyah</p>
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Collaborative Spiritual Network for Families</p>
      </footer>
    </div>
  );
};

export default App;
