import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Brush } from 'recharts';
import { motion } from 'framer-motion';

export default function HourlyChart({ data, dataKey, color, title, unit = '', formatYAxis = (v) => v, yDomain = ['auto', 'auto'] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl h-[400px] w-full"
    >
      <h3 className="text-lg font-semibold mb-4 text-white/90">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="timeLabel" 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} 
              minTickGap={30}
            />
            <YAxis 
              domain={yDomain}
              tickFormatter={formatYAxis} 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} 
              width={40}
            />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}
              formatter={(value) => [`${value}${unit}`, title]}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              strokeWidth={2}
            />
            <Brush 
              dataKey="timeLabel" 
              height={30} 
              stroke="rgba(255,255,255,0.3)" 
              fill="rgba(0,0,0,0.2)"
              tickFormatter={() => ''}
              travellerWidth={10}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
