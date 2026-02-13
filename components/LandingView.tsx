
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
  
  const [globalTotal, setGlobalTotal] = useState<number>(0);

  // Get current dates
  const now = new Date();
  const gregorianDate = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const hijriDate = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

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
      
      {/* Top Bar Navigation (Dark Theme) */}
      <div className="w-full bg-[#4b5563] text-white py-2 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <button className="hover:text-cyan-400 transition-colors"><i className="fas fa-user-circle text-lg"></i></button>
          <span className="opacity-30">|</span>
          <button className="hover:text-cyan-400 transition-colors"><i className="fas fa-search text-lg"></i></button>
          <span className="opacity-30">|</span>
          <button className="hover:text-cyan-400 transition-colors"><i className="fas fa-share-alt text-lg"></i></button>
          <span className="opacity-30">|</span>
          <button className="hover:text-cyan-400 transition-colors"><i className="fas fa-envelope text-lg"></i></button>
        </div>
        
        <div className="arabic-text text-2xl sm:text-3xl font-bold tracking-widest drop-shadow-sm mb-2 md:mb-0">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>

        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold">
           <i className="fas fa-sun text-cyan-400"></i>
           <span className="tracking-wide">{hijriDate}</span>
           <span className="opacity-30">|</span>
           <span className="tracking-wide">{gregorianDate}</span>
        </div>
      </div>

      <div className="max-w-6xl w-full px-4 pt-12 pb-20">
        
        {/* Salawat and Global Counter Section */}
        <div className="text-center mb-16">
          <div className="arabic-text text-xl sm:text-2xl text-slate-700 leading-loose mb-8 px-4 font-medium">
            اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ<br/>
            اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ، وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ، وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ
          </div>

          <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-10">
            {formattedGlobalTotal.split('').map((digit, idx) => (
              <React.Fragment key={idx}>
                <div className="relative w-10 sm:w-16 h-14 sm:h-24 bg-[#008080] rounded-lg shadow-lg flex items-center justify-center overflow-hidden border-b-4 border-black/20">
                  {/* Flip center line */}
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
          
          {/* Action Card (Search/Create) */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-cyan-500/5 p-8 sm:p-12 border border-slate-100 relative overflow-hidden h-full">
              {!showCreate ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-2">Find a Family Tracker</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join your existing family circle</p>
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
                      <i className="fas fa-plus-circle"></i> Create Dedicated Family Legacy
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
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Setup Circle</h2>
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
                    {isCreating ? 'Activating...' : 'Activate Family Domain'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Instructions Panel (Urdu) */}
          <div className="w-full lg:w-1/2" dir="rtl">
            <div className="bg-white/90 border border-cyan-100 rounded-[2.5rem] p-8 sm:p-10 shadow-xl relative overflow-hidden h-full">
              <h2 className="serif-font text-2xl font-bold text-cyan-600 mb-6 border-b border-cyan-50 pb-4">رہنمائی برائے استعمال:</h2>
              <div className="serif-font text-base text-slate-700 leading-loose space-y-4">
                <p className="font-bold text-slate-800">ایصالِ ثواب کے اس عمل میں شامل ہونے کا طریقہ:</p>
                <ul className="space-y-3 pr-2">
                  <li className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-[10px]">۱</span>
                    <p className="pt-0.5">اپنے مرحوم فیملی ممبر کا نام درج کر کے ان کا ایصالِ ثواب ٹریکر بنائیں۔</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-[10px]">۲</span>
                    <p className="pt-0.5">اس کے بعد فیملی کے تمام افراد (بیٹے، بیٹیاں، رشتے دار) ایک ہی ٹریکر میں حصہ ڈال سکتے ہیں۔</p>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center shrink-0 font-bold text-[10px]">۳</span>
                    <p className="pt-0.5">پہلی بار اپنا نام لکھ کر کوئی تلاوت یا ذکر شامل کریں، آپ کا نام فیملی لسٹ میں محفوظ ہو جائے گا۔</p>
                  </li>
                </ul>
                <div className="pt-4 text-center">
                  <p className="text-lg font-bold text-cyan-700 italic leading-relaxed">
                    اللہ پاک آپ کی اس کوشش کو قبول فرمائے اور مرحومین کے درجات بلند کرے۔ آمین۔
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* New Quran & Sunnah Section */}
        <div className="max-w-4xl mx-auto text-center" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 sm:p-16 shadow-sm border-t-8 border-t-cyan-500">
             <h2 className="serif-font text-3xl sm:text-4xl font-bold text-slate-800 mb-10">
               دعا اور صدقۂ جاریہ کے ذریعے ثواب پہنچانا — قرآن و سنت کی روشنی میں
             </h2>
             
             <div className="serif-font text-lg sm:text-xl text-slate-700 leading-relaxed space-y-10">
                <p>ہم سب اپنے مرحومین اور تمام مومنین کے لیے مغفرت اور بلندیٔ درجات کی دعا کرتے ہیں۔ قرآنِ کریم ہمیں سکھاتا ہے:</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl italic">
                   <p className="text-2xl sm:text-3xl text-cyan-700 mb-4 font-bold">رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ</p>
                   <p className="text-base text-slate-500">اے ہمارے رب! ہمیں بخش دے اور ہمارے اُن بھائیوں کو بھی جو ہم سے پہلے ایمان لائے۔</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl italic">
                   <p className="text-2xl sm:text-3xl text-cyan-700 mb-4 font-bold">رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ</p>
                   <p className="text-base text-slate-500">اے میرے رب! مجھے، میرے والدین کو اور تمام مومنوں کو بخش دے۔</p>
                </div>

                <p>اور ہم یہ جامع دعا بھی کرتے ہیں:</p>

                <div className="bg-cyan-50 p-8 rounded-[2rem] border border-cyan-100">
                   <p className="text-2xl sm:text-3xl text-cyan-800 mb-4 font-bold">اللهم اغفر للمؤمنين والمؤمنات والمسلمين والمسلمات الأحياء منهم والأموات</p>
                   <p className="text-base text-cyan-700 font-medium">اے اللہ! تمام مومن مردوں اور عورتوں، زندہ اور وفات پا چکے سب کی مغفرت فرما۔</p>
                </div>

                <p className="font-bold text-slate-800 pt-6">
                   ہم نیت کرتے ہیں کہ یہ دعا اور ہر نیک عمل کا ثواب حضرت آدم علیہ السلام سے لے کر قیامت تک آنے والے تمام مومنین و مومنات کو پہنچے۔
                   اللہ تعالیٰ ہم سب کی دعاؤں کو قبول فرمائے۔ آمین۔
                </p>
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
