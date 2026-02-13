
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
  const [newPassedDate, setNewPassedDate] = useState('');
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
    const result = await apiService.createDescent(newName, newLocation, newPassedDate);
    if (result) {
      onSelectFamily(result);
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-cyan-50/20 flex flex-col items-center py-12 px-4 sm:px-8 animate-in fade-in duration-1000">
      <div className="max-w-6xl w-full">
        {/* Top Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-7xl font-black cyan-theme serif-font mb-4">Esal-e-Sawab</h1>
          <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em]">Spiritual Legacy • Collective Remembrance • Sadaqah Jariyah</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Instructions Panel (Beautifully Styled Urdu Content) */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1" dir="rtl">
            <div className="bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-[2.5rem] p-8 sm:p-10 shadow-xl shadow-cyan-500/5 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <i className="fas fa-quote-right text-6xl text-cyan-500"></i>
              </div>
              
              <h2 className="serif-font text-3xl font-bold text-cyan-600 mb-8 border-b border-cyan-50 pb-4">
                السلام علیکم،
              </h2>
              
              <div className="serif-font text-lg text-slate-700 leading-relaxed space-y-6">
                <p className="font-bold text-slate-800">
                  براہِ کرم درج ذیل ہدایات پر عمل کرتے ہوئے اپنے مرحوم عزیز کے لیے حصہ لیں:
                </p>
                
                <ul className="space-y-4 pr-2">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۱</span>
                    <p>اپنے فوت شدہ فیملی ممبر کا نام، تاریخِ وفات اور علاقہ لازمی درج کر کے ایڈ کریں۔</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۲</span>
                    <p>جب فیملی تخلیق ہو جائے تو اس میں بیٹے، بیٹیاں، داماد، بہو، بھتیجے، بھتیجیاں، بھانجے، بھانجیاں اور دیگر متعلقہ افراد شامل ہو سکتے ہیں۔</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۳</span>
                    <p>فیملی میں شامل ہونے کے لیے صرف اپنا نام درج کریں۔</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۴</span>
                    <p>جیسے ہی آپ پہلی بار کوئی تلاوت / ذکر / درود شریف پوسٹ کریں گے، آپ کا نام خودکار طور پر اس فیملی میں محفوظ ہو جائے گا۔</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۵</span>
                    <p>آئندہ تمام اجتماعی ایصالِ ثواب میں آپ کا نام خود بخود شامل ہوتا رہے گا۔</p>
                  </li>
                </ul>

                <div className="pt-8 text-center">
                  <p className="text-xl font-bold text-cyan-700 mb-2">
                    اللہ تعالیٰ آپ کے مرحومین کی مغفرت فرمائے اور اس عمل کو صدقۂ جاریہ بنائے۔ آمین۔
                  </p>
                </div>

                <div className="pt-6 border-t border-cyan-50 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <i className="fas fa-signature text-xl"></i>
                   </div>
                   <div className="text-right">
                      <p className="font-bold text-slate-800 text-xl leading-none mb-1">محمد فیصل</p>
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-500 opacity-70">Founder Esal-e-Sawab</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Card (Search/Create) */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-cyan-500/10 p-8 sm:p-12 border border-cyan-50 relative overflow-hidden h-full">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-300 via-cyan-500 to-cyan-300"></div>
              
              {!showCreate ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-500 mx-auto mb-4 shadow-inner">
                      <i className="fas fa-moon text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-2">Find a Domain</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search for your family's collective tracker</p>
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
                      className="w-full pl-12 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-inner"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto no-scrollbar animate-in slide-in-from-top-2 duration-300">
                        {searchResults.map((descent) => (
                          <button
                            key={descent.id}
                            onClick={() => onSelectFamily(descent)}
                            className="w-full px-6 py-4 text-left hover:bg-cyan-50 transition-colors flex justify-between items-center group border-b border-slate-50 last:border-0"
                          >
                            <div>
                              <p className="text-base font-black text-slate-700 group-hover:text-cyan-600 transition-colors">{descent.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{descent.location}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-cyan-500 group-hover:text-white flex items-center justify-center transition-all">
                              <i className="fas fa-chevron-right text-[10px]"></i>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Or Initiate New Collective</p>
                    <button 
                      onClick={() => setShowCreate(true)}
                      className="w-full bg-cyan-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-cyan-500/20 hover:bg-cyan-600 transition-all uppercase text-[12px] tracking-widest flex items-center justify-center gap-3 active:scale-95"
                    >
                      <i className="fas fa-plus-circle"></i> Create New Legacy Domain
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-6">
                  <button 
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 flex items-center gap-2 transition-colors mb-4"
                  >
                    <i className="fas fa-arrow-left-long"></i> Back to search
                  </button>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-2">Create Legacy</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start a dedicated spiritual domain for your family</p>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Deceased Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Chaudhary Liaqat Ali" 
                        value={newName}
                        required
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Location / Ancestral Area</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mozang, Lahore" 
                        value={newLocation}
                        required
                        onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Date of Passing (For Anniversaries)</label>
                      <input 
                        type="date" 
                        value={newPassedDate}
                        onChange={(e) => setNewPassedDate(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700 shadow-inner"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-cyan-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-cyan-500/20 hover:bg-cyan-600 disabled:bg-slate-300 transition-all uppercase text-[12px] tracking-widest mt-8"
                  >
                    {isCreating ? 'Establishing Domain...' : 'Activate Collective Tracker'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Global Footer Decoration */}
        <footer className="mt-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
             <div className="h-px w-12 bg-slate-200"></div>
             <i className="fas fa-star-and-crescent text-slate-300 text-sm"></i>
             <div className="h-px w-12 bg-slate-200"></div>
          </div>
          <p className="text-[10px] uppercase font-black tracking-[0.8em] text-slate-300">Privacy First • Community Driven • Eternal Rewards</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingView;
