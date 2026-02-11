
import React, { useState } from 'react';
import { RecitationInfo } from '../types';

interface RecitationCardProps {
  info: RecitationInfo;
  totalCount: number;
  onAdd: (count: number) => void;
  isListView?: boolean;
}

const RecitationCard: React.FC<RecitationCardProps> = ({ info, totalCount, onAdd, isListView = false }) => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTrigger = (amount: number) => {
    setIsAnimating(true);
    onAdd(amount);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleCustomAdd = () => {
    const val = parseInt(customAmount);
    if (!isNaN(val) && val > 0) {
      handleTrigger(val);
      setCustomAmount('');
    }
  };

  if (isListView) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cyan-50 flex flex-col md:flex-row items-center gap-4 p-4 transition-all hover:bg-cyan-50/10">
        <div className="flex items-center gap-3 w-full md:w-64">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-400 shrink-0">
            <i className={`fas ${info.icon} text-sm`}></i>
          </div>
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider truncate">{info.title}</h3>
        </div>

        <div className="flex items-center justify-center w-24">
          <span className={`text-sm font-black text-cyan-500 transition-transform ${isAnimating ? 'scale-125' : 'scale-100'}`}>
            {totalCount.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-grow gap-1.5 justify-center">
          {[1, 10, 100, 1000].map((num) => (
            <button
              key={num}
              onClick={() => handleTrigger(num)}
              className="py-1.5 px-3 text-[10px] font-bold text-slate-500 bg-slate-50 rounded hover:bg-cyan-100 transition-all border border-slate-100 active:scale-95"
            >
              +{num >= 1000 ? '1K' : num}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden w-full md:w-48">
          <input
            type="number"
            placeholder="Custom"
            className="w-full px-3 py-1.5 text-[10px] outline-none bg-transparent text-slate-700 font-bold"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
          <button onClick={handleCustomAdd} className="bg-cyan-400 text-white px-3 py-1.5 text-[10px] font-black uppercase hover:bg-cyan-500">
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md shadow-cyan-900/5 border border-cyan-50 overflow-hidden flex flex-col p-5 transition-all hover:shadow-cyan-200/40 hover:-translate-y-0.5">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-400 shadow-inner">
          <i className={`fas ${info.icon} text-base`}></i>
        </div>
        <h3 className="font-black text-slate-700 text-[11px] tracking-wide uppercase">{info.title}</h3>
      </div>

      <div className="flex flex-col items-center justify-center mb-6 flex-grow relative">
        <div className={`relative flex items-center justify-center transition-transform duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
          <div className={`w-24 h-24 rounded-full border-[5px] transition-colors duration-500 flex flex-col items-center justify-center bg-white shadow-lg ${isAnimating ? 'border-cyan-500 bg-cyan-50/10' : 'border-cyan-400'}`}>
            <span className="text-xl font-black text-slate-800 tracking-tighter">
              {totalCount > 9999 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount.toLocaleString()}
            </span>
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-[0.1em] mt-0.5">recited</p>
          </div>
          {isAnimating && (
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-cyan-400 opacity-20"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-4">
        {[1, 10, 100, 1000].map((num) => (
          <button
            key={num}
            onClick={() => handleTrigger(num)}
            className="py-1.5 text-[10px] font-black text-slate-600 bg-cyan-50/50 rounded-md hover:bg-cyan-100 transition-all border border-cyan-50 active:scale-95"
          >
            +{num >= 1000 ? '1K' : num}
          </button>
        ))}
      </div>

      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden group focus-within:border-cyan-400 transition-all">
        <input
          type="number"
          placeholder="Custom"
          className="flex-grow px-3 py-2 text-[10px] outline-none bg-transparent text-slate-700 font-bold"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
        />
        <button 
          onClick={handleCustomAdd}
          className="bg-cyan-400 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-sm shadow-cyan-400/10"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default RecitationCard;
