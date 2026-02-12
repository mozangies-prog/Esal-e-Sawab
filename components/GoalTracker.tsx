
import React, { useState } from 'react';
import { Goal, RecitationType } from '../types';
import { RECITATIONS } from '../constants';

interface GoalTrackerProps {
  goals: Goal[];
  currentStats: Record<string, number>;
  onSetGoal: (type: RecitationType, target: number) => void;
  isCollective: boolean;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, currentStats, onSetGoal, isCollective }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<RecitationType>(RecitationType.FATIHA);
  const [targetValue, setTargetValue] = useState<string>('');

  const handleSave = () => {
    const val = parseInt(targetValue);
    if (!isNaN(val) && val > 0) {
      onSetGoal(selectedType, val);
      setIsEditing(false);
      setTargetValue('');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-cyan-100 p-6 mb-8 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-bullseye text-cyan-500"></i>
            {isCollective ? 'Collective Goals' : 'Personal Targets'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Striving together for Sadaqah Jariyah</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-cyan-100 transition-all border border-cyan-100"
        >
          {isEditing ? 'Cancel' : 'Set New Goal'}
        </button>
      </div>

      {isEditing && (
        <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Recitation Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RecitationType)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
              >
                {RECITATIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Target Count</label>
              <input 
                type="number"
                placeholder="e.g. 10000"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-cyan-400"
              />
            </div>
            <button 
              onClick={handleSave}
              className="w-full sm:w-auto bg-cyan-500 text-white px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
            >
              Save Goal
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-xs font-medium italic">No goals set yet. Click "Set New Goal" to start tracking progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const current = currentStats[goal.recitationType] || 0;
            const percentage = Math.min(Math.round((current / goal.target) * 100), 100);
            const info = RECITATIONS.find(r => r.id === goal.recitationType);
            
            return (
              <div key={goal.recitationType} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-cyan-50 flex items-center justify-center text-cyan-400 text-[10px]">
                      <i className={`fas ${info?.icon || 'fa-star'}`}></i>
                    </div>
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[120px]">{info?.title}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400">{percentage}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                  <div 
                    className={`h-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-1000 ease-out rounded-full shadow-sm`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span>{current.toLocaleString()} Done</span>
                  <span>Goal: {goal.target.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
