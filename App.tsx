
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
        return { ...parsed, deceasedName: MEMORIAL_NAME, contributions: parsed.contributions || [] };
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
  const [dbStatus, setDbStatus] = useState<'live' | 'local' | 'connecting' | 'error'>('connecting');
  const [dbError, setDbError] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("Bismillah. Your collective prayers are a gift that transcends this world.");
  
  const isOnline = dbStatus === 'live';

  const syncWithServer = async () => {
    const statsResult = await apiService.getStats();
    
    // Check for explicit error from server
    if (statsResult && statsResult.error) {
      setDbStatus('error');
      setDbError(statsResult.detail || statsResult.error);
      return;
    }

    const contribs = await apiService.getContributions();

    if (statsResult && !statsResult.error && contribs) {
      setGlobalStats(statsResult);
      setLocalData(prev => ({ ...prev, contributions: contribs }));
      setDbStatus('live');
      setDbError(null);
    } else {
      if (dbStatus !== 'error' && dbStatus !== 'local') {
        setDbStatus('local');
      }
    }
  };

  useEffect(() => {
    syncWithServer();
    const interval = setInterval(syncWithServer, isOnline ? POLLING_FAST : POLLING_SLOW);
    return () => clearInterval(interval);
  }, [isOnline]);

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
      if (isOnline && globalStats) {
        const dbKey = `total_${t.replace(/\s+/g, '_')}`;
        map[t] = globalStats[dbKey] || 0;
      } else {
        map[t] = localData.contributions
          .filter(c => c.recitationType === t)
          .reduce((sum, c) => sum + c.count, 0);
      }
    });
    return map;
  }, [globalStats, localData.contributions, isOnline]);

  const grandTotal = isOnline ? (globalStats?.grandTotal || 0) : Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 pt-6 max-w-[1600px] mx-auto transition-all">
      {/* DB Connection Critical Error Banner */}
      {dbStatus === 'error' && (
        <div className="mb-6 bg-red-600 text-white rounded-2xl p-6 shadow-2xl animate-bounce border-b-4 border-red-800">
          <div className="flex items-center gap-4">
            <i className="fas fa-database text-3xl"></i>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Railway MySQL Error Detected</h2>
              <p className="text-xs font-mono bg-red-700/50 p-2 rounded mt-2 select-all">{dbError}</p>
              <p className="text-[10px] mt-2 opacity-80">The app is using process.env.MYSQL_URL. Check your Railway dashboard for connection string errors.</p>
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
            <p className="text-sm font-medium text-slate-700 italic">"{aiInsight}"</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold cyan-theme serif-font mb-1">Esal-e-Sawab</h1>
          <div className="flex items-center gap-2 justify-center lg:justify-start">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : dbStatus === 'error' ? 'bg-red-500' : 'bg-orange-400'}`}></span>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {isOnline ? 'MySQL Live Sync' : dbStatus === 'error' ? 'DB CONNECTION FAILED' : 'Local Storage Active'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-50 p-3 px-6 flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-cyan-500 font-black text-2xl leading-tight">{grandTotal.toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-50 p-3 px-6 min-w-[280px]">
            <p className="text-[10px] font-bold text-slate-300 uppercase">Memorial Foundation</p>
            <h2 className="serif-font text-2xl font-bold cyan-theme truncate">{MEMORIAL_NAME}</h2>
          </div>
        </div>
      </div>

      {/* User Input Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-50 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="bg-white shadow-sm p-3 rounded-xl text-cyan-500 border border-cyan-50">
            <i className="fas fa-user-check text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Your Name</p>
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

        <div className="flex bg-slate-100/50 rounded-xl p-1.5 border border-slate-200/50">
          <button onClick={() => setViewMode('grid')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400'}`}>
             Grid View
          </button>
          <button onClick={() => setViewMode('list')} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400'}`}>
             List View
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className={`grid gap-4 mb-12 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7' : 'grid-cols-1'}`}>
        {RECITATIONS.map((rec) => (
          <RecitationCard key={rec.id} info={rec} totalCount={totals[rec.id] || 0} onAdd={(count) => handleAdd(rec.id, count)} isListView={viewMode === 'list'} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-cyan-50 p-8 shadow-sm max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Recent Contributions</h2>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              {isOnline ? 'MySQL Real-time' : 'Local History'}
            </span>
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {localData.contributions.length === 0 ? (
            <div className="text-center py-16 opacity-30">
              <i className="fas fa-dove text-4xl mb-3"></i>
              <p className="text-slate-400 text-sm italic font-medium">No activity yet. Be the first to recite.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localData.contributions.slice(0, 50).map((c) => (
                <div key={c.id} className={`flex justify-between items-center p-4 px-6 rounded-2xl bg-slate-50 border border-transparent transition-all ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${lastAddedId === c.id ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-white text-slate-300 border-slate-100'}`}>
                      <i className="fas fa-check text-xs"></i>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">{c.contributorName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.recitationType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-cyan-500 font-black text-lg">+{c.count.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-300 font-bold">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
