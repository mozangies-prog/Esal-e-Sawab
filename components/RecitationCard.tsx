
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
      <div className="bg-white rounded-lg shadow-sm border border-cyan-50 flex flex-col md:flex-row items-center gap-3 p-2 px-4 transition-all hover:bg-cyan-50/10 mb-2">
        <div className="flex items-center gap-3 w-full md:w-56">
          <div className="w-8 h-8 rounded-md bg-cyan-50 flex items-center justify-center text-cyan-400 shrink-0">
            <i className={`fas ${info.icon} text-xs`}></i>
          </div>
          <h3 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider truncate">{info.title}</h3>
        </div>

        <div className="flex items-center justify-center w-20">
          <span className={`text-xs font-black text-cyan-600 transition-transform ${isAnimating ? 'scale-125' : 'scale-100'}`}>
            {totalCount.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-grow gap-1 justify-center">
          {[1, 10, 100, 1000].map((num) => (
            <button
              key={num}
              onClick={() => handleTrigger(num)}
              className="py-1 px-2.5 text-[9px] font-bold text-slate-500 bg-slate-50 rounded hover:bg-cyan-100 transition-all border border-slate-100"
            >
              +{num >= 1000 ? '1K' : num}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md overflow-hidden w-full md:w-40">
          <input
            type="number"
            placeholder="Custom"
            className="w-full px-2 py-1 text-[9px] outline-none bg-transparent text-slate-700 font-bold"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
          <button onClick={handleCustomAdd} className="bg-cyan-400 text-white px-2.5 py-1 text-[9px] font-black uppercase hover:bg-cyan-500">
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-50 overflow-hidden flex flex-col p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-400 shadow-inner">
          <i className={`fas ${info.icon} text-xs`}></i>
        </div>
        <h3 className="font-black text-slate-700 text-[9px] tracking-wide uppercase truncate">{info.title}</h3>
      </div>

      <div className="flex flex-col items-center justify-center mb-4 flex-grow relative">
        <div className={`relative flex items-center justify-center transition-transform duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
          <div className={`w-16 h-16 rounded-full border-[4px] transition-colors duration-500 flex flex-col items-center justify-center bg-white shadow-sm ${isAnimating ? 'border-cyan-500 bg-cyan-50/10' : 'border-cyan-400'}`}>
            <span className="text-sm font-black text-slate-800 tracking-tighter">
              {totalCount > 9999 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount.toLocaleString()}
            </span>
          </div>
          {isAnimating && (
            <div className="absolute inset-0 animate-ping rounded-full border-2 border-cyan-400 opacity-20"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 mb-3">
        {[1, 10, 100, 1000].map((num) => (
          <button
            key={num}
            onClick={() => handleTrigger(num)}
            className="py-1 text-[9px] font-black text-slate-600 bg-cyan-50/50 rounded hover:bg-cyan-100 transition-all border border-cyan-50"
          >
            +{num >= 1000 ? '1K' : num}
          </button>
        ))}
      </div>

      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md overflow-hidden group focus-within:border-cyan-400 transition-all">
        <input
          type="number"
          placeholder="Qty"
          className="flex-grow px-2 py-1.5 text-[9px] outline-none bg-transparent text-slate-700 font-bold"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
        />
        <button 
          onClick={handleCustomAdd}
          className="bg-cyan-400 text-white px-3 py-1.5 text-[9px] font-black uppercase hover:bg-cyan-500 transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default RecitationCard;
