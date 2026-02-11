
import React, { useState, useEffect, useMemo } from 'react';
import { RecitationType, Contribution, EsalData } from './types';
import { RECITATIONS } from './constants';
import RecitationCard from './components/RecitationCard';

const App: React.FC = () => {
  const [data, setData] = useState<EsalData>(() => {
    const saved = localStorage.getItem('esal_sawab_v2');
    return saved ? JSON.parse(saved) : {
      deceasedName: 'Chaudhary Liaqat Ali',
      passedDate: '11 February 2023',
      contributions: []
    };
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
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-12 pt-8 transition-all duration-500 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold cyan-theme serif-font mb-2 tracking-tight">Esal-e-Sawab</h1>
          <p className="text-slate-500 text-sm sm:text-base font-light">A journey of collective blessings and rewards for the departed soul.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Total Recitations Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-50 p-4 w-full sm:w-56 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Grand Total</span>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[4px] border-cyan-400 flex items-center justify-center bg-cyan-50/30">
              <span className="text-cyan-500 font-black text-lg">
                {grandTotal > 9999 ? `${(grandTotal / 1000).toFixed(1)}k` : grandTotal}
              </span>
            </div>
          </div>

          {/* Memorial Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-50 p-5 w-full sm:w-72 flex flex-col items-center text-center relative">
            {isEditingMemorial ? (
              <div className="space-y-2 w-full">
                <input 
                  className="w-full border-b border-cyan-100 p-1.5 text-xs text-center font-bold text-slate-700 outline-none focus:border-cyan-400" 
                  value={memorialName} 
                  onChange={(e) => setMemorialName(e.target.value)} 
                  placeholder="Name"
                />
                <input 
                  className="w-full border-b border-cyan-100 p-1.5 text-xs text-center text-slate-500 outline-none focus:border-cyan-400" 
                  value={memorialDate} 
                  onChange={(e) => setMemorialDate(e.target.value)} 
                  placeholder="Passed Date"
                />
                <div className="flex gap-2 justify-center pt-2">
                  <button onClick={updateMemorial} className="bg-cyan-400 text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase hover:bg-cyan-500">Save</button>
                  <button onClick={() => setIsEditingMemorial(false)} className="bg-slate-100 text-slate-500 text-[9px] px-3 py-1 rounded-full font-bold uppercase hover:bg-slate-200">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setIsEditingMemorial(true)} className="absolute top-3 right-3 text-slate-200 hover:text-cyan-400">
                  <i className="fas fa-edit text-[10px]"></i>
                </button>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">In loving memory of</span>
                <h2 className="serif-font text-2xl font-bold cyan-theme leading-tight mb-1">{data.deceasedName}</h2>
                <div className="h-px w-8 bg-cyan-50 my-1"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.passedDate}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel: Name & View Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="w-full max-w-sm">
          <label className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2 block text-center md:text-left">Contributor Name</label>
          <input
            id="user-name-input"
            type="text"
            placeholder="Your name..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-white border-b-2 border-slate-100 py-2 px-1 outline-none text-slate-700 font-bold text-lg focus:border-cyan-400 transition-all rounded-t-lg"
          />
        </div>

        <div className="flex bg-white rounded-full p-1 border border-slate-100 shadow-sm">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'grid' ? 'bg-cyan-400 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-th-large"></i> Grid
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-cyan-400 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <i className="fas fa-list"></i> List
          </button>
        </div>
      </div>

      {/* Recitation View Area */}
      <div className={`grid gap-4 sm:gap-6 mb-20 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
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

      {/* Activity Log */}
      <div className="bg-white rounded-3xl border border-cyan-50 p-6 sm:p-10 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800">Spiritual Journal</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recitations Logged Locally</p>
        </div>
        
        <div className="flex flex-col w-full">
          {data.contributions.length === 0 ? (
            <div className="text-center py-16 opacity-30">
              <i className="fas fa-scroll text-4xl text-cyan-200 mb-3"></i>
              <p className="text-slate-400 text-sm italic font-medium">No recitations logged yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {(Object.entries(groupedContributions) as [string, Contribution[]][]).map(([date, contributions]) => (
                <div key={date}>
                  <h3 className="text-[9px] font-black text-cyan-500 uppercase tracking-widest mb-4 border-b border-cyan-50 pb-1">{date}</h3>
                  <div className="space-y-2">
                    {contributions.map((c) => (
                      <div 
                        key={c.id} 
                        className={`flex justify-between items-center p-3 rounded-lg bg-slate-50/50 border border-transparent hover:border-cyan-100 transition-all ${lastAddedId === c.id ? 'bg-cyan-50 border-cyan-200 scale-[1.01]' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-300 text-[10px]">
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{c.contributorName}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-medium">{c.recitationType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-cyan-500 font-black text-sm">+{c.count}</span>
                          <p className="text-[8px] text-slate-300 font-bold uppercase">{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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

      {/* Footer */}
      <footer className="text-center py-12 text-slate-400">
        <p className="text-[9px] uppercase font-black tracking-[0.3em] mb-1">© 2026 Esal-e-Sawab Platform</p>
        <p className="text-[8px] uppercase font-bold tracking-[0.2em] text-cyan-200">Shared privately within the family.</p>
      </footer>
    </div>
  );
};

export default App;
