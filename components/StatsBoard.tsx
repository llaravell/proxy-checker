import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ProxyItem, CheckStatus, ChartData } from '../types';
import { COLORS } from '../constants';

interface StatsBoardProps {
  proxies: ProxyItem[];
}

const StatsBoard: React.FC<StatsBoardProps> = ({ proxies }) => {
  const total = proxies.length;
  const working = proxies.filter(p => p.status === CheckStatus.WORKING).length;
  const dead = proxies.filter(p => p.status === CheckStatus.DEAD).length;
  const idle = proxies.filter(p => p.status === CheckStatus.IDLE || p.status === CheckStatus.CHECKING).length;

  const statusData: ChartData[] = [
    { name: 'فعال', value: working, fill: COLORS.success },
    { name: 'غیرفعال', value: dead, fill: COLORS.danger },
    { name: 'در انتظار', value: idle, fill: COLORS.warning },
  ].filter(d => d.value > 0);

  // Calculate country distribution from working proxies
  const countryCounts = proxies
    .filter(p => p.status === CheckStatus.WORKING && p.country)
    .reduce((acc: Record<string, number>, curr) => {
      const code = curr.country || 'Unknown';
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const countryData = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Summary Card */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-center items-center">
        <h3 className="text-slate-400 text-sm font-medium mb-2">نرخ موفقیت</h3>
        <div className="text-4xl font-bold text-white mb-1">
          {total > 0 ? Math.round((working / (working + dead || 1)) * 100) : 0}%
        </div>
        <div className="text-xs text-slate-500">
          {working} سالم / {dead} خراب
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm h-48">
        <h3 className="text-slate-400 text-sm font-medium mb-2">توزیع وضعیت</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'right' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart (Geo Analysis) */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm h-48">
        <h3 className="text-slate-400 text-sm font-medium mb-2">موقعیت‌های برتر (فعال)</h3>
        {countryData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} orientation="right" />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'right' }}
              />
              <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500 text-center">
            هنوز پروکسی فعالی<br/>پیدا نشده است
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsBoard;