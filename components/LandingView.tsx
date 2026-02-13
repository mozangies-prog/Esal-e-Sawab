
import React, { useState, useEffect } from 'react';
import { Descent } from '../types';
import { apiService } from '../services/apiService';

interface LandingViewProps {
  onSelectFamily: (family: Descent) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onSelectFamily }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Descent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await apiService.searchDescents(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newLocation.trim()) return;
    setIsCreating(true);
    const result = await apiService.createDescent(newName, newLocation);
    if (result) {
      onSelectFamily(result);
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-cyan-50/30 flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full text-center mb-12">
        <h1 className="text-4xl sm:text-6xl font-black cyan-theme serif-font mb-4">Esal-e-Sawab</h1>
        <p className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">Spiritual Legacy & Collective Remembrance</p>
      </div>

      <div className="max-w-xl w-full bg-white rounded-[2rem] shadow-2xl shadow-cyan-500/10 p-8 sm:p-12 border border-cyan-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-300 via-cyan-500 to-cyan-300"></div>
        
        {!showCreate ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Find a Descent</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join your family's collective prayer circle</p>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400">
                <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
              </div>
              <input 
                type="text" 
                placeholder="Search by name or location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-inner"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 max-h-60 overflow-y-auto overflow-x-hidden no-scrollbar animate-in slide-in-from-top-2 duration-300">
                  {searchResults.map((descent) => (
                    <button
                      key={descent.id}
                      onClick={() => onSelectFamily(descent)}
                      className="w-full px-6 py-4 text-left hover:bg-cyan-50 transition-colors flex justify-between items-center group border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-700 group-hover:text-cyan-600 transition-colors">{descent.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{descent.location}</p>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-slate-300 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"></i>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Or start a new legacy</p>
              <button 
                onClick={() => setShowCreate(true)}
                className="w-full bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> Create New Descent
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6">
            <button 
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 flex items-center gap-1 transition-colors"
            >
              <i className="fas fa-arrow-left"></i> Back to search
            </button>

            <div className="text-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Create Descent</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initialize a private domain for your family</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Deceased Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chaudhary Liaqat Ali" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-1">Location (To differentiate)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mozang, Lahore" 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isCreating}
              className="w-full bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 disabled:bg-slate-300 transition-all uppercase text-[11px] tracking-widest"
            >
              {isCreating ? 'Initializing...' : 'Start Collective Domain'}
            </button>
          </form>
        )}
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[9px] uppercase font-black tracking-[0.6em] text-slate-300">Privacy First • Community Driven • Esal-e-Sawab</p>
      </footer>
    </div>
  );
};

export default LandingView;
