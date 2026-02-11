
import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, EsalData } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';

const App: React.FC = () => {
  const [data, setData] = useState<EsalData>(() => {
    try {
      const saved = localStorage.getItem('esal_sawab_v2');
      return saved ? JSON.parse(saved) : {
        deceasedName: 'Chaudhary Liaqat Ali',
        passedDate: '11 February 2023',
        contributions: []
      };
    } catch (e) {
      return { deceasedName: 'Chaudhary Liaqat Ali', passedDate: '11 February 2023', contributions: [] };
    }
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('esal_user_name') || '');
  const [isEditingMemorial, setIsEditingMemorial] = useState(false);
  const [memorialName, setMemorialName] = useState(data.deceasedName);
  const [memorialDate, setMemorialDate] = useState(data.passedDate);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('esal_view_mode') as 'grid' | 'list') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('esal_sawab_v2', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('esal_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('esal_view_mode', viewMode);
  }, [viewMode]);

  const handleAdd = (type: RecitationType, count: number) => {
    if (!userName.trim()) {
      alert("Please enter your name at the top first.");
      const input = document.getElementById('user-name-input');
      input?.focus();
      return;
    }

    const newId = crypto.randomUUID();
    const newContrib: Contribution = {
      id: newId,
      contributorName: userName,
      recitationType: type,
      count: count,
      timestamp: Date.now()
    };

    setLastAddedId(newId);
    setData(prev => ({
      ...prev,
      contributions: [newContrib, ...prev.contributions]
    }));

    setTimeout(() => setLastAddedId(null), 2000);
  };

  const totals = useMemo(() => {
    const map: Record<string, number> = {};
    Object.values(RecitationType).forEach(t => map[t] = 0);
    data.contributions.forEach(c => {
      map[c.recitationType] = (map[c.recitationType] || 0) + c.count;
    });
    return map;
  }, [data.contributions]);

  const grandTotal = useMemo(() => {
    return Object.values(totals).reduce((a: number, b: number) => a + b, 0);
  }, [totals]);

  const updateMemorial = () => {
    setData(prev => ({ ...prev, deceasedName: memorialName, passedDate: memorialDate }));
    setIsEditingMemorial(false);
  };

  const groupedContributions = useMemo(() => {
    const groups: Record<string, Contribution[]> = {};
    data.contributions.forEach(c => {
      const date = new Date(c.timestamp);
      const day = date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[day]) groups[day] = [];
      groups[day].push(c);
    });
    return groups;
  }, [data.contributions]);

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-500 max-w-[1800px] mx-auto">
      {/* Header Section - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold cyan-theme serif-font mb-0 tracking-tight">Esal-e-Sawab</h1>
          <p className="text-slate-400 text-[10px] sm:text-xs font-medium uppercase tracking-widest">Collective Digital Tracker</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {/* Compact Grand Total */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-50 p-2 px-4 flex items-center gap-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            <span className="text-cyan-500 font-black text-xl leading-none">
              {grandTotal > 9999 ? `${(grandTotal / 1000).toFixed(1)}k` : grandTotal}
            </span>
          </div>

          {/* Compact Memorial Card */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-50 p-2 px-4 flex items-center gap-3 relative min-w-[240px]">
            {isEditingMemorial ? (
              <div className="flex items-center gap-2 w-full animate-fade-in">
                <input 
                  className="flex-1 border-b border-cyan-100 p-1 text-[10px] font-bold text-slate-700 outline-none focus:border-cyan-400" 
                  value={memorialName} 
                  onChange={(e) => setMemorialName(e.target.value)} 
                />
                <button onClick={updateMemorial} className="bg-cyan-400 text-white text-[8px] px-2 py-1 rounded-md font-bold uppercase">OK</button>
              </div>
            ) : (
              <>
                <div className="text-left">
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">In Memory Of</p>
                  <h2 className="serif-font text-base font-bold cyan-theme leading-tight truncate max-w-[150px]">{data.deceasedName}</h2>
                </div>
                <button onClick={() => setIsEditingMemorial(true)} className="ml-auto text-slate-200 hover:text-cyan-400 p-1">
                  <i className="fas fa-edit text-[9px]"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input & View Switcher - Compact */}
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-cyan-50 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
            <i className="fas fa-user-edit text-xs"></i>
          </div>
          <input
            id="user-name-input"
            type="text"
            placeholder="Your name for the log..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-transparent border-b border-slate-200 py-1 outline-none text-slate-700 font-bold text-sm focus:border-cyan-400 transition-all"
          />
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-th-large"></i> Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-list"></i> List
          </button>
        </div>
      </div>

      {/* Recitation View Area - Ultra-Responsive Grid */}
      <div className={`grid gap-3 sm:gap-4 mb-12 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
        {RECITATIONS.map((rec) => (
          <RecitationCard
            key={rec.id}
            info={rec}
            totalCount={totals[rec.id] || 0}
            onAdd={(count) => handleAdd(rec.id, count)}
            isListView={viewMode === 'list'}
          />
        ))}
      </div>

      {/* Activity Log - Compressed */}
      <div className="bg-white rounded-2xl border border-cyan-50 p-6 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Activity</h2>
          <div className="h-px bg-cyan-50 flex-grow mx-4"></div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {data.contributions.length === 0 ? (
            <div className="text-center py-10 opacity-30">
              <p className="text-slate-400 text-[10px] italic font-bold">Waiting for first contribution...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(Object.entries(groupedContributions) as [string, Contribution[]][]).map(([date, contributions]) => (
                <div key={date}>
                  <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-2 sticky top-0 bg-white py-1">{date}</p>
                  <div className="space-y-1.5">
                    {contributions.map((c) => (
                      <div 
                        key={c.id} 
                        className={`flex justify-between items-center p-2 px-3 rounded-lg bg-slate-50 border border-transparent hover:border-cyan-100 transition-all ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-700">{c.contributorName}</span>
                          <span className="text-[8px] text-slate-300 font-bold px-1.5 bg-white rounded border border-slate-100">{c.recitationType}</span>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-cyan-500 font-black text-xs">+{c.count}</span>
                          <span className="text-[8px] text-slate-300 font-bold">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="text-center py-8 text-slate-300">
        <p className="text-[8px] uppercase font-black tracking-[0.4em]">Esal-e-Sawab • Sadaqah Jariyah</p>
      </footer>
    </div>
  );
};

export default App;
