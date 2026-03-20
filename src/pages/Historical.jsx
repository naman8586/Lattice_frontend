import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subYears, isAfter, differenceInDays, parseISO, subDays } from 'date-fns';
import { toDate } from 'date-fns-tz';
import { Calendar, AlertCircle, Sun, Compass } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Brush, Legend } from 'recharts';

import { useGeolocation } from '../hooks/useGeolocation';
import { fetchHistoricalWeather } from '../services/api';

export default function Historical() {
  const { latitude, longitude, loaded, error } = useGeolocation();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const maxPastDate = format(subYears(new Date(), 2), 'yyyy-MM-dd');

  // Default selection: last 30 days
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd')); // default 30 days ago
  const [endDate, setEndDate] = useState(today);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!loaded) return;
    if (error || !latitude || !longitude) return;

    // Validate range maximum 2 years total, ending basically today. API archive extends up to past 2 weeks but we'll fetch what we can.
    // If range > 2 years, we should warn user, but input min/max handles it.
    
    const loadData = async () => {
      setLoading(true);
      setFetchError(null);
      setData(null); // Clear old data to prevent stale charts
      try {
        const res = await fetchHistoricalWeather(latitude, longitude, startDate, endDate);
        setData(res);
      } catch (err) {
        setFetchError("Failed to fetch historical data for this range.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if diff is valid
    if (new Date(endDate) >= new Date(startDate)) {
       loadData();
    }

  }, [loaded, latitude, longitude, startDate, endDate, error]);

  const chartData = useMemo(() => {
    if (!data?.daily) return [];
    const arr = [];
    for (let i = 0; i < data.daily.time.length; i++) {
        // Sunrise/Sunset to IST explicitly
        const sRise = data.daily.sunrise[i];
        const sSet = data.daily.sunset[i];
        
        // Parse UTC time from Open-Meteo, convert to IST
        let sunriseIST = '';
        let sunsetIST = '';
        if (sRise && sSet) {
          const rDate = toDate(sRise);
          const sDate = toDate(sSet);
          
          // Format in IST locally for display on tooltip
          sunriseIST = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short' }).format(rDate);
          sunsetIST = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short' }).format(sDate);
        }

        arr.push({
            date: data.daily.time[i],
            tempMean: data.daily.temperature_2m_mean[i],
            tempMax: data.daily.temperature_2m_max[i],
            tempMin: data.daily.temperature_2m_min[i],
            precip: data.daily.precipitation_sum[i],
            windMax: data.daily.wind_speed_10m_max[i],
            windDir: data.daily.wind_direction_10m_dominant[i],
            sunriseIST,
            sunsetIST,
            sunCycleString: `${sunriseIST} - ${sunsetIST}`
        });
    }
    return arr;
  }, [data]);

  const totalPrecipitation = useMemo(() => {
    if (!chartData.length) return 0;
    return chartData.reduce((acc, curr) => acc + (curr.precip || 0), 0).toFixed(1);
  }, [chartData]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#f4f7f6] dark:bg-[#121212] transition-colors duration-300 p-6 lg:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8 max-w-7xl mx-auto"
      >
      <div className="mt-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500 drop-shadow-lg mb-2">
          Historical Trends
        </h1>
        <p className="text-gray-300">Analyze long-term weather patterns up to 2 years back.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl flex flex-col sm:flex-row items-center gap-4">
        <Calendar className="text-blue-400 w-6 h-6 shrink-0" />
        <div className="flex space-x-2 items-center w-full">
            <div className="flex flex-col flex-1">
                <label className="text-xs text-gray-400 mb-1 ml-1">Start Date</label>
                <input 
                    type="date" 
                    value={startDate}
                    min={maxPastDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10 focus:border-blue-400 transition-colors"
                />
            </div>
            <span className="text-gray-500 mt-5">to</span>
            <div className="flex flex-col flex-1">
                <label className="text-xs text-gray-400 mb-1 ml-1">End Date</label>
                <input 
                    type="date" 
                    value={endDate}
                    min={startDate}
                    max={today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10 focus:border-blue-400 transition-colors"
                />
            </div>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-500/20 text-red-100 p-4 rounded-xl flex items-center border border-red-500/50">
           <AlertCircle className="w-5 h-5 mr-3" />
           {fetchError}
        </div>
      )}

      {loading && !fetchError && (
        <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-blue-300">Loading historical dataset...</span>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                   <h3 className="text-sm text-gray-400 mb-1">Total Precipitation over Range</h3>
                   <p className="text-4xl font-bold text-cyan-300">{totalPrecipitation} mm</p>
               </div>
               <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                   <h3 className="text-sm text-gray-400 mb-1">Total Days</h3>
                   <p className="text-4xl font-bold text-teal-300">{chartData.length} days</p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Temperature Trends */}
                <motion.div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl h-[450px] w-full">
                    <h3 className="text-lg font-semibold mb-4 text-white/90">Temperature Trends (°C)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMaxTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorMinTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} minTickGap={50}/>
                            <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend verticalAlign="top" height={36} />
                            <Area type="monotone" name="Max Temp" dataKey="tempMax" stroke="#ef4444" fill="url(#colorMaxTemp)" />
                            <Area type="monotone" name="Mean Temp" dataKey="tempMean" stroke="#f59e0b" fill="none" strokeWidth={2} />
                            <Area type="monotone" name="Min Temp" dataKey="tempMin" stroke="#3b82f6" fill="url(#colorMinTemp)" />
                            <Brush dataKey="date" height={30} stroke="rgba(255,255,255,0.2)" fill="rgba(0,0,0,0.3)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Wind and Precipitation */}
                <motion.div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl h-[400px] w-full">
                    <h3 className="text-lg font-semibold mb-4 text-white/90">Wind Speed (max km/h) & Precipitation (mm)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} minTickGap={50}/>
                            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar yAxisId="left" name="Precipitation" dataKey="precip" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" name="Max Wind" dataKey="windMax" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            <Brush dataKey="date" height={30} stroke="rgba(255,255,255,0.2)" fill="rgba(0,0,0,0.3)" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Sun Cycle Info (Custom Visualization since it's hard to plot time effectively, we'll plot the duration maybe? Or just show a table-like chart) */}
                <motion.div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/10 shadow-2xl overflow-x-auto">
                   <h3 className="text-lg font-semibold mb-4 text-white/90">Sun Cycle & Dominant Wind Direction (Sampled)</h3>
                   <div className="min-w-[600px]">
                     <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/10 uppercase font-semibold text-gray-200">
                           <tr>
                               <th className="p-3 rounded-tl-lg">Date</th>
                               <th className="p-3">Sunrise (IST)</th>
                               <th className="p-3">Sunset (IST)</th>
                               <th className="p-3 rounded-tr-lg">Wind Dir (°)</th>
                           </tr>
                        </thead>
                        <tbody>
                           {/* Only show 1 entry per week approx to avoid massive lists, or first 30 */}
                           {chartData.filter((_, i) => i % Math.ceil(chartData.length / 30) === 0).map((day, idx) => (
                             <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                 <td className="p-3">{day.date}</td>
                                 <td className="p-3 flex items-center space-x-2"><Sun className="w-4 h-4 text-yellow-400"/> {day.sunriseIST}</td>
                                 <td className="p-3 flex items-center space-x-2"><Sun className="w-4 h-4 text-orange-500"/> {day.sunsetIST}</td>
                                 <td className="p-3 flex items-center space-x-2">
                                    <Compass className="w-4 h-4 text-blue-300" style={{ transform: `rotate(${day.windDir}deg)` }}/> 
                                    {day.windDir}°
                                 </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   </div>
                </motion.div>

            </div>
        </>
      )}

      </motion.div>
    </div>
  );
}
