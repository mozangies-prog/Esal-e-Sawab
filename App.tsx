
import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, EsalData } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';
import { getSpiritualInsight } from './services/geminiService';
import { logger } from './services/logger';
import { apiService } from './services/apiService';

const STORAGE_KEY = 'esal_sawab_v2';
const USER_KEY = 'esal_user_name';
const VIEW_KEY = 'esal_view_mode';

const MEMORIAL_NAME = 'Chaudhary Liaqat Ali';
const POLLING_FAST = 5000;
const POLLING_SLOW = 20000;

const App: React.FC = () => {
  const [localData, setLocalData] = useState<EsalData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { 
          ...parsed, 
          deceasedName: MEMORIAL_NAME, 
          contributions: parsed.contributions || []
        };
      }
    } catch (e) {
      logger.debug("Starting with clean local state");
    }
    return { deceasedName: MEMORIAL_NAME, passedDate: '', contributions: [] };
  });

  const [userName, setUserName] = useState(() => localStorage.getItem(USER_KEY) || '');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') || 'grid'
  );
  
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'collective' | 'personal' | 'connecting' | 'unavailable'>('connecting');
  const [aiInsight, setAiInsight] = useState<string>("Bismillah. Your collective prayers are a gift that transcends this world.");
  
  const isCollective = syncStatus === 'collective';

  const syncWithServer = async () => {
    const statsResult = await apiService.getStats();
    
    if (statsResult && statsResult.error) {
      setSyncStatus('unavailable');
      return;
    }

    const contribs = await apiService.getContributions();

    if (statsResult && !statsResult.error && contribs) {
      setGlobalStats(statsResult);
      setLocalData(prev => ({ 
        ...prev, 
        contributions: contribs
      }));
      setSyncStatus('collective');
    } else {
      if (syncStatus !== 'unavailable' && syncStatus !== 'personal') {
        setSyncStatus('personal');
      }
    }
  };

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, isCollective ? POLLING_FAST : POLLING_SLOW);
    return () => clearInterval(interval);
  }, [isCollective]);

  useEffect(() => localStorage.setItem(USER_KEY, userName), [userName]);
  useEffect(() => localStorage.setItem(VIEW_KEY, viewMode), [viewMode]);

  const handleAdd = async (type: RecitationType, count: number) => {
    if (!userName.trim()) {
      alert("Please enter your name first.");
      document.getElementById('user-name-input')?.focus();
      return;
    }

    const newContrib = {
      id: crypto.randomUUID(),
      contributorName: userName,
      recitationType: type,
      count: count,
      timestamp: Date.now()
    };

    setLastAddedId(newContrib.id);

    // Optimistic UI Update
    const updatedContribs = [newContrib, ...localData.contributions];
    const updatedData = { ...localData, contributions: updatedContribs };
    setLocalData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

    // Server Update
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
        map[t] = localData.contributions
          .filter(c => c.recitationType === t)
          .reduce((sum, c) => sum + c.count, 0);
      }
    });
    return map;
  }, [globalStats, localData.contributions, isCollective]);

  const grandTotal = isCollective ? (globalStats?.grandTotal || 0) : (Object.values(totals) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="min-h-screen pb-12 px-3 sm:px-6 lg:px-8 pt-4 max-w-[1600px] mx-auto transition-all">
      {/* Connection Alert Banner */}
      {syncStatus === 'unavailable' && (
        <div className="mb-4 bg-slate-800 text-white rounded-xl p-3 shadow-lg border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <i className="fas fa-circle-nodes text-cyan-400"></i>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">Sync Status</p>
              <p className="text-[11px] font-medium leading-tight">Collective prayers are temporarily unavailable. Your contributions are being saved locally.</p>
            </div>
          </div>
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
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold cyan-theme serif-font mb-1">Esal-e-Sawab</h1>
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <span className={`w-1.5 h-1.5 rounded-full ${isCollective ? 'bg-green-400 animate-pulse' : syncStatus === 'unavailable' ? 'bg-slate-400' : 'bg-orange-400'}`}></span>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
              {isCollective ? 'Collective Real-time Sync' : syncStatus === 'unavailable' ? 'Sync Unavailable' : 'Personal Mode'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-cyan-50 p-2.5 px-5 flex flex-col items-center min-w-[140px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Done</span>
            <span className="text-cyan-500 font-black text-xl sm:text-2xl leading-tight">{grandTotal.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-cyan-50 p-2.5 px-5 min-w-[200px] flex flex-col items-center lg:items-start">
            <p className="text-[9px] font-bold text-slate-300 uppercase">In Memory Of</p>
            <h2 className="serif-font text-xl sm:text-2xl font-bold cyan-theme truncate tracking-wide">{MEMORIAL_NAME}</h2>
          </div>
        </div>
      </div>

      {/* User Input Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-50 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="bg-white shadow-sm p-3 rounded-xl text-cyan-500 border border-cyan-50 hidden sm:block">
            <i className="fas fa-user-check text-sm"></i>
          </div>
          <div className="flex-1 w-full">
            <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Contributor Name</p>
            <input
              id="user-name-input"
              type="text"
              placeholder="Who is contributing?..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-transparent border-b border-slate-100 py-1 outline-none text-slate-700 font-bold text-sm focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex bg-slate-100/50 rounded-xl p-1 border border-slate-200/50 w-full md:w-auto">
          <button onClick={() => setViewMode('grid')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
             Grid
          </button>
          <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
             List
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className={`grid gap-3 mb-10 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7' : 'grid-cols-1'}`}>
        {RECITATIONS.map((rec) => (
          <RecitationCard key={rec.id} info={rec} totalCount={totals[rec.id] || 0} onAdd={(count) => handleAdd(rec.id, count)} isListView={viewMode === 'list'} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-cyan-50 p-5 sm:p-8 shadow-sm max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm sm:text-lg font-black text-slate-800 uppercase tracking-widest">Recent Activity</h2>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              {isCollective ? 'Collective Updates' : 'Personal History'}
            </span>
          </div>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {localData.contributions.length === 0 ? (
            <div className="text-center py-12 opacity-30">
              <i className="fas fa-dove text-3xl mb-3"></i>
              <p className="text-slate-400 text-xs italic font-medium">No activity yet. Be the first to recite.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {localData.contributions.slice(0, 50).map((c) => (
                <div key={c.id} className={`flex justify-between items-center p-3 px-4 rounded-xl bg-slate-50 border border-transparent transition-all ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[10px] ${lastAddedId === c.id ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-white text-slate-300 border-slate-100'}`}>
                      <i className="fas fa-heart"></i>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-700 leading-none mb-1">{c.contributorName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.recitationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-500 font-black text-sm sm:text-base">+{c.count.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-300 font-bold uppercase">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="text-center py-10 mt-10 border-t border-slate-100">
        <p className="text-[9px] uppercase font-black tracking-[0.6em] text-slate-300">Esal-e-Sawab • Sadaqah Jariyah</p>
      </footer>
    </div>
  );
};

export default App;
