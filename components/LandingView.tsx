
import React, { useState, useEffect } from 'react';
import { Descent } from '../types';
import { apiService } from '../services/apiService';

interface LandingViewProps {
  onSelectFamily: (family: Descent) => void;
}

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

const LandingView: React.FC<LandingViewProps> = ({ onSelectFamily }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Descent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPassedDate, setNewPassedDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [globalTotal, setGlobalTotal] = useState<number>(0);

  useEffect(() => {
    const fetchGlobal = async () => {
      const total = await apiService.fetchGlobalStats();
      setGlobalTotal(total);
    };
    fetchGlobal();
    const interval = setInterval(fetchGlobal, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const formattedGlobalTotal = globalTotal.toString().padStart(8, '0');

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center animate-in fade-in duration-1000">
      
      {/* Top Bar Navigation */}
      <div className="w-full bg-[#4b5563] text-white py-3 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className="flex items-center gap-2 group cursor-default">
            <TasbeehLogo className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-transform group-hover:rotate-12" />
            <span className="text-sm font-black uppercase tracking-tighter text-cyan-400">Esal-e-Sawab</span>
          </div>
        </div>
        
        {/* Centered Bismillah */}
        <div className="arabic-text text-xl sm:text-2xl font-normal drop-shadow-sm" style={{ lineHeight: '1.2' }}>
          بِسْمِ اللہِ الرَّحْمٰنِ الرَّحِیْمِ
        </div>

        <div className="hidden md:block w-32"></div>
      </div>

      <div className="max-w-6xl w-full px-4 pt-10 pb-20">
        
        {/* Branding Hero Section */}
        <div className="text-center mb-10 flex flex-col items-center">
           <div className="mb-6 animate-bounce-slow">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-10 rounded-full"></div>
                <TasbeehLogo className="w-20 h-20 text-cyan-500 relative z-10 drop-shadow-xl" />
              </div>
           </div>
           <h1 className="text-3xl sm:text-5xl font-black text-slate-800 uppercase tracking-tighter mb-2">
             Esal-e-Sawab – Connect, Pray, Remember
           </h1>
           <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.5em]">Digital Spiritual Legacy</p>
        </div>

        {/* Salawat */}
        <div className="text-center mb-16">
          <div className="arabic-text text-lg sm:text-xl text-slate-700 leading-relaxed mb-8 px-4 font-normal max-w-4xl mx-auto">
            اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ<br/>
            اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ
          </div>

          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-10">
            {formattedGlobalTotal.split('').map((digit, idx) => (
              <React.Fragment key={idx}>
                <div className="relative w-10 sm:w-16 h-14 sm:h-24 bg-[#008080] rounded-lg shadow-lg flex items-center justify-center overflow-hidden border-b-4 border-black/20">
                  <div className="absolute w-full h-[2px] bg-black/30 top-1/2 -translate-y-1/2 z-10"></div>
                  <span className="text-3xl sm:text-6xl font-black text-white relative z-0">{digit}</span>
                </div>
                {(idx === 1 || idx === 4) && (
                  <div className="self-end pb-2 sm:pb-4 text-3xl sm:text-5xl font-black text-[#008080]">,</div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-6">Total Global Recitations Contributed</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-stretch mb-20">
          
          {/* Action Card */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-cyan-500/5 p-8 sm:p-12 border border-slate-100 relative overflow-hidden h-full">
              {!showCreate ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-2">Find a Family Circle</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join your existing family legacy</p>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500">
                      <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'}`}></i>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search name or location..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-inner"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto no-scrollbar">
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
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Create New Circle</p>
                    <button 
                      onClick={() => setShowCreate(true)}
                      className="w-full bg-cyan-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-cyan-500/20 hover:bg-cyan-600 transition-all uppercase text-[11px] tracking-widest flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-plus-circle"></i> Setup Family Legacy Page
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-6">
                  <button 
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 flex items-center gap-2 mb-4"
                  >
                    <i className="fas fa-arrow-left"></i> Back to search
                  </button>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Setup Legacy Page</h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Deceased Name</label>
                      <input type="text" placeholder="Full Name" value={newName} required onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">City / Location</label>
                      <input type="text" placeholder="e.g. Islamabad, PK" value={newLocation} required onChange={(e) => setNewLocation(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Date of Passing</label>
                      <input type="date" value={newPassedDate} onChange={(e) => setNewPassedDate(e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:border-cyan-400 transition-all text-sm font-bold text-slate-700 shadow-inner" />
                    </div>
                  </div>

                  <button type="submit" disabled={isCreating} className="w-full bg-cyan-500 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-cyan-600 transition-all uppercase text-[11px] tracking-widest mt-8">
                    {isCreating ? 'Creating...' : 'Activate Legacy Domain'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="w-full lg:w-1/2" dir="rtl">
            <div className="bg-white/90 border border-cyan-100 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden h-full">
              <h2 className="arabic-text text-2xl font-bold text-cyan-600 mb-6 border-b border-cyan-50 pb-4">رہنمائی برائے استعمال:</h2>
              <div className="arabic-text text-lg text-slate-700 leading-relaxed space-y-4">
                <p className="font-bold text-slate-800">ایصالِ ثواب کے اس عمل میں شامل ہونے کا طریقہ:</p>
                <ul className="space-y-4 pr-2">
                  <li className="flex gap-4 items-start">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۱</span>
                    <p className="pt-1">اپنے مرحوم فیملی ممبر کا نام درج کر کے ان کا ایصالِ ثواب ٹریکر بنائیں۔</p>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۲</span>
                    <p className="pt-1">اس کے بعد فیملی کے تمام افراد (بیٹے، بیٹیاں، رشتے دار) ایک ہی ٹریکر میں حصہ ڈال سکتے ہیں۔</p>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-sm">۳</span>
                    <p className="pt-1">پہلی بار اپنا نام لکھ کر کوئی تلاوت یا ذکر شامل کریں، آپ کا نام فیملی لسٹ میں محفوظ ہو جائے گا۔</p>
                  </li>
                </ul>
                <div className="pt-6 text-center">
                  <p className="text-xl font-bold text-cyan-700 italic leading-relaxed">
                    اللہ پاک آپ کی اس کوشش کو قبول فرمائے اور مرحومین کے درجات بلند کرے۔ آمین۔
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Quran & Sunnah Section */}
        <div className="max-w-4xl mx-auto text-center" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 sm:p-16 shadow-sm border-t-8 border-t-cyan-500">
             <h2 className="arabic-text text-2xl sm:text-3xl font-bold text-slate-800 mb-10 leading-snug">
               دعا اور صدقۂ جاریہ کے ذریعے ثواب پہنچانا — قرآن و سنت کی روشنی میں
             </h2>
             
             <div className="arabic-text text-lg sm:text-xl text-slate-700 leading-relaxed space-y-8">
                <p>ہم سب اپنے مرحومین اور تمام مومنین کے لیے مغفرت اور بلندیٔ درجات کی دعا کرتے ہیں۔ قرآنِ کریم ہمیں سکھاتا ہے:</p>
                
                <div className="bg-slate-50 p-8 rounded-2xl">
                   <p className="text-2xl sm:text-3xl text-cyan-700 mb-4 font-bold leading-relaxed">رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ</p>
                   <p className="text-sm text-slate-500 font-medium">اے ہمارے رب! ہمیں بخش دے اور ہمارے اُن بھائیوں کو بھی جو ہم سے پہلے ایمان لائے۔</p>
                </div>

                <div className="bg-slate-50 p-8 rounded-2xl">
                   <p className="text-2xl sm:text-3xl text-cyan-700 mb-4 font-bold leading-relaxed">رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ</p>
                   <p className="text-sm text-slate-500 font-medium">اے میرے رب! مجھے، میرے والدین کو اور تمام مومنوں کو بخش دے۔</p>
                </div>

                <p>اور ہم یہ جامع دعا بھی کرتے ہیں:</p>

                <div className="bg-cyan-50 p-8 rounded-[2rem] border border-cyan-100">
                   <p className="text-2xl sm:text-3xl text-cyan-800 mb-4 font-bold leading-relaxed">اللهم اغفر للمؤمنين والمؤمنات والمسلمين والمسلمات الأحياء منهم والأموات</p>
                   <p className="text-sm text-cyan-700 font-bold">اے اللہ! تمام مومن مردوں اور عورتوں، زندہ اور وفات پا چکے سب کی مغفرت فرما۔</p>
                </div>

                <div className="pt-8 space-y-4">
                  <p className="font-bold text-slate-800 text-lg sm:text-xl">
                    اس ایپ پر تمام اذکار و پڑھائی کا ثواب حضرت آدم (ع) سے قیامت تک کے انبیاء، صحابہ کرام، اولیاء، صالحین، علمائے دین اور تمام مومنین و مومنات کو پہنچے۔
                  </p>
                  <p className="font-bold text-cyan-700 text-lg sm:text-xl">
                    اللہ تعالیٰ ہم سب کی دعاؤں کو قبول فرمائے۔ آمین۔
                  </p>
                  <p className="font-bold text-slate-800 text-lg sm:text-xl">محمد فیصل</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Founder Esal-e-Sawab</p>
                </div>
             </div>
          </div>
        </div>

        {/* Footer Dedication */}
        <footer className="mt-20 text-center px-4">
          <div className="max-w-3xl mx-auto mb-10 arabic-text text-lg text-slate-600 leading-relaxed" dir="rtl">
             <div className="space-y-6 flex flex-col items-center">
               <p className="mb-4">
                 اس ایپ پر تمام اذکار و پڑھائی کا ثواب حضرت آدم (ع) سے قیامت تک کے انبیاء، صحابہ کرام، اولیاء، صالحین، علمائے دین اور تمام مومنین و مومنات کو پہنچے۔
               </p>
               <p className="font-bold text-cyan-700">اللہ تعالیٰ ہم سب کی دعاؤں کو قبول فرمائے۔ آمین۔</p>
               
               <div className="mt-8 flex flex-col items-center">
                 <TasbeehLogo className="w-10 h-10 text-slate-300 mb-4 opacity-50" />
                 <p className="font-bold text-slate-800 text-xl mb-1">محمد فیصل</p>
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400">Founder Esal-e-Sawab</p>
               </div>
             </div>
          </div>

          <p className="text-[10px] uppercase font-black tracking-[0.8em] text-slate-300 mt-12">Privacy First • Community Driven • Eternal Rewards</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingView;
