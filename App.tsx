
import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, EsalData, Descent } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';
import RecitationCharts from './components/RecitationCharts';
import LandingView from './components/LandingView';
import { getSpiritualInsight } from './services/geminiService';
import { logger } from './services/logger';
import { apiService } from './services/apiService';

const VIEW_KEY = 'esal_view_mode';
const FAMILY_KEY = 'esal_current_family';

const POLLING_FAST = 5000;
const POLLING_SLOW = 20000;

const App: React.FC = () => {
  const [currentFamily, setCurrentFamily] = useState<Descent | null>(() => {
    const saved = localStorage.getItem(FAMILY_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  
  // Scope user name to the specific family to avoid leakage between domains
  const [userName, setUserName] = useState('');
  
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') || 'grid'
  );
  
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'collective' | 'personal' | 'connecting' | 'unavailable'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("Bismillah. Your collective prayers are a gift that transcends this world.");
  
  const isCollective = syncStatus === 'collective';

  // Load the scoped user name when the family changes
  useEffect(() => {
    if (currentFamily) {
      const scopedKey = `esal_user_name_${currentFamily.id}`;
      setUserName(localStorage.getItem(scopedKey) || '');
    }
  }, [currentFamily]);

  // Derive unique reciters from the active family's contribution history ONLY
  const familyMembers = useMemo(() => {
    const names = contributions.map(c => c.contributorName);
    return Array.from(new Set(names)).sort();
  }, [contributions]);

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
      
      return { days, isToday, dateLabel: passed.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' }) };
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

  // Save the scoped user name
  useEffect(() => {
    if (currentFamily && userName.trim()) {
      const scopedKey = `esal_user_name_${currentFamily.id}`;
      localStorage.setItem(scopedKey, userName);
    }
  }, [userName, currentFamily]);

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

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentFamily(null)}
          className="group flex items-center gap-4 bg-white hover:bg-cyan-600 border-2 border-cyan-500 text-cyan-600 hover:text-white p-2 pr-6 rounded-2xl transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          <div className="w-12 h-12 bg-cyan-500 group-hover:bg-white/20 text-white rounded-xl flex items-center justify-center text-xl">
            <i className="fas fa-users-viewfinder"></i>
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Domain Settings</p>
            <p className="text-xs font-black uppercase tracking-wider">Switch Family</p>
          </div>
        </button>

        <div className="flex-1 flex flex-col md:flex-row items-center gap-4 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-cyan-50">
          <div className="flex-1 text-center md:text-left px-4">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Honoring the legacy of</p>
             <h1 className="serif-font text-2xl sm:text-3xl font-black text-slate-800 leading-none">
              {currentFamily.name}
              <span className="text-cyan-500 ml-3 text-sm font-bold uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">{currentFamily.location}</span>
             </h1>
          </div>
          <div className="bg-cyan-500 text-white px-8 py-3 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Grand Total</span>
             <span className="text-2xl font-black tabular-nums">{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Anniversary Striking Reminder */}
      {anniversaryInfo && (
        <div className={`mb-8 p-6 rounded-[2.5rem] border transition-all duration-1000 relative overflow-hidden ${anniversaryInfo.isToday ? 'bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-400 border-cyan-300 shadow-2xl shadow-cyan-500/40 text-white' : 'bg-white border-cyan-100 shadow-sm'}`}>
          {anniversaryInfo.isToday && (
             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <i className="fas fa-cloud-moon text-[120px]"></i>
             </div>
          )}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl shadow-inner ${anniversaryInfo.isToday ? 'bg-white/20' : 'bg-cyan-50 text-cyan-500'}`}>
                <i className={`fas ${anniversaryInfo.isToday ? 'fa-star-and-crescent' : 'fa-calendar-check'}`}></i>
              </div>
              <div className="text-center lg:text-left">
                <h3 className={`text-2xl font-black uppercase tracking-widest mb-1 ${anniversaryInfo.isToday ? 'text-white' : 'text-slate-800'}`}>
                  {anniversaryInfo.isToday ? "Special Day of Remembrance" : "Death Anniversary Remembrance"}
                </h3>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <p className={`text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${anniversaryInfo.isToday ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    Passed: {anniversaryInfo.dateLabel}
                  </p>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${anniversaryInfo.isToday ? 'bg-white text-cyan-600' : 'bg-cyan-50 text-cyan-600'}`}>
                    {anniversaryInfo.isToday ? "Occurring Today" : `In ${anniversaryInfo.days} Days`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Banner */}
      <div className="mb-8 bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 relative overflow-hidden group">
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600 shrink-0">
            <i className="fas fa-lightbulb text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Spiritual Insight</p>
            <p className="text-xs sm:text-sm font-medium text-slate-700 italic leading-relaxed">"{aiInsight}"</p>
          </div>
        </div>
      </div>

      {/* User Input Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-5 border border-cyan-50 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-5 w-full max-w-lg">
          <div className="bg-white shadow-sm p-3.5 rounded-2xl text-cyan-500 border border-cyan-50 hidden sm:block shrink-0">
            <i className="fas fa-user-circle text-base"></i>
          </div>
          <div className="flex-1 w-full">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">Contributed By (Family Circle)</p>
            <input
              id="user-name-input"
              type="text"
              list={`family-members-${currentFamily.id}`}
              placeholder="Your name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50/50 rounded-xl px-4 py-3 outline-none text-slate-700 font-bold text-sm focus:border-cyan-400 focus:bg-white border border-transparent transition-all shadow-inner"
            />
            <datalist id={`family-members-${currentFamily.id}`}>
              {familyMembers.map(name => <option key={name} value={name} />)}
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

      {/* Recitation Cards */}
      <div className={`grid gap-4 mb-10 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
        {RECITATIONS.map((rec) => (
          <RecitationCard key={rec.id} info={rec} totalCount={totals[rec.id] || 0} onAdd={(count) => handleAdd(rec.id, count)} isListView={viewMode === 'list'} />
        ))}
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-[2.5rem] border border-cyan-50 p-6 sm:p-10 shadow-sm max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-800 uppercase tracking-widest">Global Activity</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live updates from family members</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isCollective ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{isCollective ? 'Sync Active' : 'Offline'}</span>
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
          {contributions.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <i className="fas fa-layer-group text-4xl mb-4"></i>
              <p className="text-sm font-medium italic">Begin contributing to see the legacy grow.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.slice(0, 50).map((c) => (
                <div key={c.id} className={`flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-cyan-100 hover:shadow-sm transition-all ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                      <i className="fas fa-heart text-[10px]"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none mb-1">{c.contributorName}</p>
                      <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{c.recitationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-600 font-black text-lg">+{c.count.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RecitationCharts contributions={contributions} />

      <footer className="text-center py-16 mt-16 border-t border-slate-100/60 max-w-xl mx-auto">
        <p className="text-[10px] uppercase font-black tracking-[0.6em] text-slate-400 mb-4">Esal-e-Sawab Collective Tracker</p>
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">A Sadaqah Jariyah Platform</p>
      </footer>
    </div>
  );
};

export default App;
