
import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, Descent } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';
import RecitationCharts from './components/RecitationCharts';
import LandingView from './components/LandingView';
import { getSpiritualInsight } from './services/geminiService';
import { apiService } from './services/apiService';

const VIEW_KEY = 'esal_view_mode';
const FAMILY_KEY = 'esal_current_family';

const POLLING_FAST = 5000;
const POLLING_SLOW = 20000;

const TasbeehLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="40" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
    <circle cx="50" cy="10" r="4" fill="currentColor" />
    <circle cx="71" cy="19" r="4" fill="currentColor" />
    <circle cx="80" cy="40" r="4" fill="currentColor" />
    <circle cx="71" cy="61" r="4" fill="currentColor" />
    <circle cx="50" cy="70" r="4" fill="currentColor" />
    <circle cx="29" cy="61" r="4" fill="currentColor" />
    <circle cx="20" cy="40" r="4" fill="currentColor" />
    <circle cx="29" cy="19" r="4" fill="currentColor" />
    <path d="M50 70V85M45 92L50 85L55 92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M47 95V90M50 97V90M53 95V90" stroke="currentColor" strokeWidth="1" opacity="0.6" />
  </svg>
);

const App: React.FC = () => {
  const [currentFamily, setCurrentFamily] = useState<Descent | null>(() => {
    const saved = localStorage.getItem(FAMILY_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  // User requested name to be empty/hidden by default, so we no longer load from localStorage
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

  const familyMembers = useMemo(() => {
    const names = contributions.map(c => c.contributorName);
    return Array.from(new Set(names)).filter((n: string) => n.length > 0).sort();
  }, [contributions]);

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
      if (syncStatus !== 'unavailable' && syncStatus !== 'personal') setSyncStatus('personal');
    }
  };

  useEffect(() => {
    if (currentFamily) {
      syncWithServer();
      const interval = setInterval(syncWithServer, isCollective ? POLLING_FAST : POLLING_SLOW);
      return () => clearInterval(interval);
    }
  }, [currentFamily, isCollective]);

  useEffect(() => { localStorage.setItem(VIEW_KEY, viewMode); }, [viewMode]);
  // No longer saving userName to localStorage per user request
  
  useEffect(() => {
    if (currentFamily) localStorage.setItem(FAMILY_KEY, JSON.stringify(currentFamily));
    else localStorage.removeItem(FAMILY_KEY);
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
    // Optimistic update
    setContributions(prev => [newContrib, ...prev]);
    const success = await apiService.postContribution(newContrib);
    if (success) syncWithServer();
    if (Math.random() > 0.7) getSpiritualInsight(type).then(setAiInsight);
    setTimeout(() => setLastAddedId(null), 2000);
  };

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    Object.values(RecitationType).forEach(t => {
      if (isCollective && globalStats) {
        const dbKey = `total_${t.replace(/\s+/g, '_')}`;
        map[t] = globalStats[dbKey] || 0;
      } else {
        map[t] = contributions.filter(c => c.recitationType === t).reduce((sum, c) => sum + c.count, 0);
      }
    });
    return map;
  }, [globalStats, contributions, isCollective]);

  const grandTotal = isCollective ? (globalStats?.grandTotal || 0) : (Object.values(totals) as number[]).reduce((a, b) => a + b, 0);

  if (!currentFamily) return <LandingView onSelectFamily={setCurrentFamily} />;

  return (
    <div className="min-h-screen pb-12 px-3 sm:px-6 lg:px-8 pt-4 max-w-[1600px] mx-auto transition-all animate-in fade-in duration-700">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <button 
          onClick={() => setCurrentFamily(null)}
          className="group flex items-center gap-4 bg-white hover:bg-cyan-600 border-2 border-cyan-500 text-cyan-600 hover:text-white p-2 px-6 rounded-2xl transition-all shadow-lg shadow-cyan-500/10 active:scale-95"
        >
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Legacy Settings</p>
            <p className="text-xs font-black uppercase tracking-wider">Switch Family</p>
          </div>
        </button>

        <div className="flex-1 flex flex-col md:flex-row items-center gap-4 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-cyan-50">
          <div className="flex items-center justify-center p-2 hidden sm:block">
             <TasbeehLogo className="w-10 h-10 text-cyan-500" />
          </div>
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

      {/* User Input Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-5 border border-cyan-50 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-5 w-full max-w-lg">
          <div className="flex-1 w-full">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 ml-1">Contributed By (Family Circle)</p>
            <input
              id="user-name-input"
              type="text"
              placeholder="Your name..."
              value={userName}
              list={`family-members-${currentFamily.id}`}
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
            Grid
          </button>
          <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-6 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            List
          </button>
        </div>
      </div>

      {/* Recitation Cards */}
      <div className={`grid gap-4 mb-10 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
        {RECITATIONS.map((rec) => (
          <RecitationCard key={rec.id} info={rec} totalCount={totals[rec.id] || 0} onAdd={(count) => handleAdd(rec.id, count)} isListView={viewMode === 'list'} />
        ))}
      </div>

      {/* Activity Logs - Updated per latest request */}
      <div className="bg-white rounded-[2.5rem] border border-cyan-50 p-6 sm:p-10 shadow-sm max-w-6xl mx-auto mb-10">
        <h2 className="text-base sm:text-xl font-black text-slate-800 uppercase tracking-widest mb-6">Recent Participation</h2>
        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
          {contributions.length === 0 ? (
            <div className="text-center py-10 opacity-20">
              <p className="text-sm font-medium italic">Begin contributing to see the legacy grow.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.slice(0, 30).map((c) => (
                <div key={c.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-cyan-100 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div>
                      {/* Left Side: Only show contributor name, hide quantity/type */}
                      <p className="text-sm font-black text-slate-800 leading-none">
                        {c.contributorName}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Shared in the Rewards</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {/* Right Side: Move "Contributed" here with timestamp */}
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      <span className="text-cyan-500 font-black mr-1">Contributed</span>
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[8px] text-slate-300 font-bold uppercase mt-0.5">
                      {new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RecitationCharts contributions={contributions} />

      {/* Footer */}
      <footer className="text-center py-16 mt-16 border-t border-slate-100/60 max-w-4xl mx-auto">
        <div className="arabic-text text-lg text-slate-500 leading-relaxed mb-10" dir="rtl">
           <div className="flex flex-col items-center space-y-4">
             <p className="mb-4">
               اس ایپ پر تمام اذکار و پڑھائی کا ثواب حضرت آدم (ع) سے قیامت تک کے انبیاء، صحابہ کرام، اولیاء، صالحین، علمائے دین اور تمام مومنین و مومنات کو پہنچے۔
             </p>
             <p className="font-bold text-cyan-600/80">اللہ تعالیٰ ہم سب کی دعاؤں کو قبول فرمائے۔ آمین۔</p>
             
             <div className="mt-8 flex flex-col items-center">
               <TasbeehLogo className="w-10 h-10 text-slate-300 mb-4 opacity-50" />
               <p className="font-bold text-slate-800 text-lg mb-1">محمد فیصل</p>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Founder Esal-e-Sawab</p>
             </div>
           </div>
        </div>
        
        <p className="text-[10px] uppercase font-black tracking-[0.6em] text-slate-300 mt-12">Sadaqah Jariyah Platform</p>
      </footer>
    </div>
  );
};

export default App;
