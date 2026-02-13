
import React, { useMemo } from 'react';
import { Contribution, ChartPoint } from '../types';

interface RecitationChartsProps {
  contributions: Contribution[];
}

type TabType = 'recent' | 'today' | 'monthly' | 'yearly';

const RecitationCharts: React.FC<RecitationChartsProps> = ({ contributions }) => {
  const [activeTab, setActiveTab] = React.useState<TabType>('recent');

  const chartData = useMemo(() => {
    const now = new Date();
    const data: ChartPoint[] = [];

    if (activeTab === 'today') {
      // Last 24 hours in 3-hour chunks
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3 * 3600000);
        const label = d.getHours() + ":00";
        const val = contributions
          .filter(c => {
            const ct = new Date(c.timestamp);
            return ct > new Date(d.getTime() - 1.5 * 3600000) && ct <= new Date(d.getTime() + 1.5 * 3600000);
          })
          .reduce((acc, curr) => acc + curr.count, 0);
        data.push({ label, value: val });
      }
    } else if (activeTab === 'recent') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = d.toLocaleDateString([], { weekday: 'short' });
        const val = contributions
          .filter(c => {
            const ct = new Date(c.timestamp);
            return ct.toDateString() === d.toDateString();
          })
          .reduce((acc, curr) => acc + curr.count, 0);
        data.push({ label, value: val });
      }
    } else if (activeTab === 'monthly') {
      // Last 30 days in 5-day chunks
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 5 * 24 * 3600000);
        const label = d.toLocaleDateString([], { day: 'numeric', month: 'short' });
        const val = contributions
          .filter(c => {
            const ct = new Date(c.timestamp);
            return ct > new Date(d.getTime() - 2.5 * 24 * 3600000) && ct <= new Date(d.getTime() + 2.5 * 24 * 3600000);
          })
          .reduce((acc, curr) => acc + curr.count, 0);
        data.push({ label, value: val });
      }
    } else if (activeTab === 'yearly') {
      // 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString([], { month: 'short' });
        const val = contributions
          .filter(c => {
            const ct = new Date(c.timestamp);
            return ct.getMonth() === d.getMonth() && ct.getFullYear() === d.getFullYear();
          })
          .reduce((acc, curr) => acc + curr.count, 0);
        data.push({ label, value: val });
      }
    }

    return data;
  }, [contributions, activeTab]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-3xl border border-cyan-50 p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-chart-line text-cyan-500"></i>
            Recitation Analytics
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spiritual Growth Visualization</p>
        </div>
        
        <div className="flex bg-slate-100/50 rounded-xl p-1 border border-slate-200/50 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['recent', 'today', 'monthly', 'yearly'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-48 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
        {chartData.map((point, idx) => {
          const height = (point.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div 
                className="w-full bg-cyan-100 group-hover:bg-cyan-200 transition-all rounded-t-lg relative"
                style={{ height: `${height}%`, minHeight: point.value > 0 ? '4px' : '0px' }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                  {point.value.toLocaleString()}
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase mt-2 tracking-tighter sm:tracking-normal">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecitationCharts;
