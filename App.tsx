import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, EsalData } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';
import { getSpiritualInsight } from './services/geminiService';
import { logger } from './services/logger';

const App: React.FC = () => {
  const [data, setData] = useState<EsalData>(() => {
    try {
      const saved = localStorage.getItem('esal_sawab_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      logger.error("Failed to parse local storage data", e);
    }
    return {
      deceasedName: 'Loved One Name',
      passedDate: 'Date',
      contributions: []
    };
  });

  const [userName, setUserName] = useState(() => localStorage.getItem('esal_user_name') || '');
  const [isEditingMemorial, setIsEditingMemorial] = useState(false);
  const [memorialName, setMemorialName] = useState(data.deceasedName);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('esal_view_mode') as 'grid' | 'list') || 'grid';
  });
  const [aiInsight, setAiInsight] = useState<string>("Loading spiritual insight...");
  const [insightLoading, setInsightLoading] = useState(true);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('esal_sawab_v2', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('esal_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('esal_view_mode', viewMode);
  }, [viewMode]);

  // Initial AI Insight
  useEffect(() => {
    const fetchInitialInsight = async () => {
      setInsightLoading(true);
      const res = await getSpiritualInsight("Dhikr and Remembrance of Allah");
      setAiInsight(res);
      setInsightLoading(false);
    };
    fetchInitialInsight();
  }, []);

  const handleAdd = (type: RecitationType, count: number) => {
    if (!userName.trim()) {
      logger.warn("Attempted to add contribution without user name.");
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

    logger.info(`Adding ${count} to ${type} by ${userName}`);
    setLastAddedId(newId);
    setData(prev => ({
      ...prev,
      contributions: [newContrib, ...prev.contributions]
    }));

    // Randomly update insight on interaction for variety
    if (Math.random() > 0.7) {
      getSpiritualInsight(type).then(setAiInsight);
    }

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
    setData(prev => ({ ...prev, deceasedName: memorialName }));
    setIsEditingMemorial(false);
    logger.log("Memorial updated to:", memorialName);
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
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 pt-6 transition-all duration-500 max-w-[1600px] mx-auto">
      {/* AI Spiritual Insight Banner - Production Friendly */}
      <div className="mb-6 bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 animate-fade-in relative overflow-hidden group">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <i className="fas fa-mosque text-8xl text-cyan-400"></i>
        </div>
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600 shrink-0">
            <i className={`fas ${insightLoading ? 'fa-spinner fa-spin' : 'fa-lightbulb'} text-sm`}></i>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Spiritual Virtue</p>
            <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
              "{aiInsight}"
            </p>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold cyan-theme serif-font mb-1 tracking-tight">Esal-e-Sawab</h1>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.3em]">Collective Digital Tracker</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-50 p-3 px-6 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-cyan-500 font-black text-2xl leading-none">
              {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-cyan-50 p-3 px-6 flex items-center gap-4 relative min-w-[280px]">
            <div className="text-left w-full">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">In Memory Of</p>
              {isEditingMemorial ? (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    className="flex-1 border-b border-cyan-200 py-1 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500" 
                    value={memorialName} 
                    onChange={(e) => setMemorialName(e.target.value)} 
                    autoFocus
                  />
                  <button onClick={updateMemorial} className="bg-cyan-500 text-white text-[10px] px-3 py-1.5 rounded-lg font-black uppercase shadow-lg shadow-cyan-500/20">Set</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="serif-font text-xl font-bold cyan-theme truncate">{data.deceasedName}</h2>
                  <button onClick={() => setIsEditingMemorial(true)} className="text-slate-200 hover:text-cyan-400 transition-colors p-2">
                    <i className="fas fa-pen-nib text-xs"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controller Bar */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-50 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
        <div className="flex items-center gap-4 w-full max-w-md">
          <div className="bg-white shadow-sm p-3 rounded-xl text-cyan-500 border border-cyan-50">
            <i className="fas fa-id-card text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Contributor Identity</p>
            <input
              id="user-name-input"
              type="text"
              placeholder="Enter your name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-transparent border-b border-slate-100 py-1 outline-none text-slate-700 font-bold text-sm focus:border-cyan-400 transition-all placeholder:font-normal placeholder:opacity-50"
            />
          </div>
        </div>

        <div className="flex bg-slate-100/50 rounded-xl p-1.5 border border-slate-200/50">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-cyan-500 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-shapes"></i> Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-cyan-500 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-stream"></i> List
          </button>
        </div>
      </div>

      {/* Main Recitation Area */}
      <div className={`grid gap-4 mb-12 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7' : 'grid-cols-1'}`}>
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

      {/* Production-Ready Log */}
      <div className="bg-white rounded-3xl border border-cyan-50 p-8 shadow-sm max-w-5xl mx-auto overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Global Activity Log</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Real-time local contributions</p>
          </div>
          <div className="h-px bg-slate-100 flex-grow mx-8 hidden sm:block"></div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-300 uppercase">Status</span>
            <div className="flex items-center gap-2 justify-end">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-slate-700">Live</span>
            </div>
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {data.contributions.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <div className="mb-4 text-cyan-100">
                <i className="fas fa-cloud-sun text-6xl"></i>
              </div>
              <p className="text-slate-400 text-sm italic font-medium">Ready for the first recitation of the day...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(groupedContributions) as [string, Contribution[]][]).map(([date, contributions]) => (
                <div key={date} className="relative">
                  <div className="sticky top-0 bg-white/95 backdrop-blur-sm py-2 mb-4 z-20">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] inline-block border-b-2 border-cyan-400 pb-1">{date}</p>
                  </div>
                  <div className="space-y-3">
                    {contributions.map((c) => (
                      <div 
                        key={c.id} 
                        className={`group flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 px-5 rounded-2xl bg-slate-50 border border-transparent hover:border-cyan-100 transition-all ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200 ring-2 ring-cyan-100' : ''}`}
                      >
                        <div className="flex items-center gap-4 mb-2 sm:mb-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${lastAddedId === c.id ? 'bg-cyan-500 text-white' : 'bg-white text-slate-400 border border-slate-100 group-hover:text-cyan-500'}`}>
                            <i className="fas fa-check text-xs"></i>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-700 group-hover:text-cyan-600 transition-colors">{c.contributorName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{c.recitationType}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 mt-2 sm:mt-0">
                          <span className="text-cyan-500 font-black text-lg">+{c.count.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

      {/* Production Footer */}
      <footer className="text-center py-12 mt-12 border-t border-slate-100">
        <div className="flex justify-center gap-8 mb-6 text-slate-300 text-lg">
          <i className="fas fa-moon hover:text-cyan-400 transition-colors cursor-help"></i>
          <i className="fas fa-star hover:text-cyan-400 transition-colors cursor-help"></i>
          <i className="fas fa-heart hover:text-cyan-400 transition-colors cursor-help"></i>
        </div>
        <p className="text-[10px] uppercase font-black tracking-[0.8em] text-slate-400">Esal-e-Sawab • Sadaqah Jariyah</p>
        <p className="text-[8px] text-slate-200 mt-4 uppercase tracking-[0.2em]">Build 1.4.0 • Production Stable</p>
      </footer>
    </div>
  );
};

export default App;