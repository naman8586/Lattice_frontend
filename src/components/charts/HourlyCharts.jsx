import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HourlyChart = ({ data, dataKey, color, title, unit }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mt-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title} ({unit})</h3>
      
      {/* Horizontal Scroll Container for Mobile */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(str) => new Date(str).getHours() + ":00"}
                stroke="#94a3b8" 
                fontSize={12}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HourlyChart;