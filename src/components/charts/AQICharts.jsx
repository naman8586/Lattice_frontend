import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Brush 
} from 'recharts';

const AQIChart = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mt-6">
      <h3 className="text-lg font-bold text-slate-700 mb-4">Air Quality: PM10 vs PM2.5</h3>
      
      {/* Horizontal Scroll wrapper */}
      <div className="w-full overflow-x-auto h-[400px]">
        <div className="min-w-[800px] h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(str) => new Date(str).getHours() + ":00"}
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              
              {/* PM10 Line */}
              <Line 
                name="PM10"
                type="monotone" 
                dataKey="pm10" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={false} 
              />
              
              {/* PM2.5 Line */}
              <Line 
                name="PM2.5"
                type="monotone" 
                dataKey="pm25" 
                stroke="#ec4899" 
                strokeWidth={2} 
                dot={false} 
              />

              {/* ZOOM FUNCTIONALITY: The Brush component allows users to select a timeframe */}
              <Brush 
                dataKey="time" 
                height={30} 
                stroke="#cbd5e1" 
                tickFormatter={(str) => new Date(str).getHours() + ":00"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AQIChart;