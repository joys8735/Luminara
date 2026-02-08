import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  value: number;
  wins: number;
  losses: number;
}

interface PredictionChartsProps {
  title?: string;
  height?: number;
  showWinLoss?: boolean;
}

export function PredictionCharts({ 
  title = 'Performance Analytics',
  height = 300,
  showWinLoss = true
}: PredictionChartsProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [winRate, setWinRate] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [bestDay, setBestDay] = useState(0);

  useEffect(() => {
    // Генеруємо тестові дані
    const generateChartData = () => {
      const data: ChartDataPoint[] = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const timeStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const wins = Math.floor(Math.random() * 15) + 5;
        const losses = Math.floor(Math.random() * 10) + 3;
        
        data.push({
          time: timeStr,
          value: wins + losses,
          wins,
          losses
        });
      }
      
      return data;
    };

    const data = generateChartData();
    setChartData(data);

    // Calculate stats
    const totalWinsCount = data.reduce((sum, d) => sum + d.wins, 0);
    const totalLossesCount = data.reduce((sum, d) => sum + d.losses, 0);
    const rate = totalWinsCount / (totalWinsCount + totalLossesCount) * 100;
    const best = Math.max(...data.map(d => d.wins));
    
    setTotalWins(totalWinsCount);
    setWinRate(Math.round(rate));
    setBestDay(best);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#050816] border border-[#1f1f1f] rounded-lg p-2 text-xs text-[#e0e0e0]">
          {showWinLoss ? (
            <>
              <p>Wins: <span className="text-emerald-400 font-bold">{payload[0]?.value}</span></p>
              <p>Losses: <span className="text-red-400 font-bold">{payload[1]?.value}</span></p>
            </>
          ) : (
            <p>Predictions: <span className="text-[#3b82f6] font-bold">{payload[0]?.value}</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#e0e0e0]">{title}</h3>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">{winRate}% Win Rate</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-3">
          <div className="text-[11px] text-[#707070] mb-1">Total Wins</div>
          <div className="text-2xl font-bold text-emerald-400">{totalWins}</div>
        </div>
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-3">
          <div className="text-[11px] text-[#707070] mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-[#3b82f6]">{winRate}%</div>
        </div>
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-3">
          <div className="text-[11px] text-[#707070] mb-1">Best Day</div>
          <div className="text-2xl font-bold text-[#a855f7]">{bestDay}</div>
        </div>
      </div>

      {/* Line Chart - Win/Loss Trend */}
      {showWinLoss && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6"
        >
          <h4 className="text-sm font-semibold text-[#e0e0e0] mb-4">Weekly Performance</h4>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis 
                dataKey="time" 
                stroke="#707070"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#707070"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
              />
              <Bar 
                dataKey="wins" 
                fill="#10b981" 
                name="Wins"
                radius={[8, 8, 0, 0]}
              />
              <Bar 
                dataKey="losses" 
                fill="#ef4444" 
                name="Losses"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Cumulative Points Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6"
      >
        <h4 className="text-sm font-semibold text-[#e0e0e0] mb-4">Cumulative Alpha Points</h4>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData.map((d, i) => ({
            time: d.time,
            cumulative: chartData.slice(0, i + 1).reduce((sum, x) => sum + (x.wins * 10), 0)
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis 
              dataKey="time" 
              stroke="#707070"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#707070"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#050816',
                border: '1px solid #1f1f1f',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value) => [`${value} pts`, 'Alpha Points']}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Win Streak Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-emerald-500/10 to-[#3b82f6]/10 border border-emerald-500/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-[#e0e0e0]">Current Streak</h4>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-lg font-bold text-emerald-400">5 Wins</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((day) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-400">✓</span>
              </div>
              <div className="flex-1 h-1.5 bg-[#050816] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#10b981]"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, delay: day * 0.1 }}
                />
              </div>
              <span className="text-xs text-[#707070]">Day {day}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-emerald-500/20">
          <p className="text-xs text-[#a0a0a0]">
            🔥 You're on fire! Keep your winning streak going to earn bonus Alpha Points.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default PredictionCharts;
