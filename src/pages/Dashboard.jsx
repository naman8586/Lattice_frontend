import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Sun, Cloud, CloudRain, Wind, Navigation, Thermometer, Calendar, Droplets, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Brush } from 'recharts';
import { motion } from 'framer-motion';

import { useGeolocation } from '../hooks/useGeolocation';
import { fetchWeatherForecast, fetchAirQuality, fetchLocationName } from '../services/api';

export default function Dashboard({ theme }) {
  const { latitude, longitude, loaded, error } = useGeolocation();
  const [data, setData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [locationName, setLocationName] = useState('Locating...');
  const [selectedDate, setSelectedDate] = useState('');
  const [tempUnit, setTempUnit] = useState('C');

  useEffect(() => {
    if (!loaded || !latitude || !longitude) return;
    const loadData = async () => {
      try {
        const [weatherRes, aqiRes, locName] = await Promise.all([
          fetchWeatherForecast(latitude, longitude, selectedDate),
          fetchAirQuality(latitude, longitude, selectedDate),
          fetchLocationName(latitude, longitude)
        ]);
        setData(weatherRes);
        setAqiData(aqiRes);
        setLocationName(locName === "Unknown Location" ? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` : locName);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    loadData();
  }, [loaded, latitude, longitude, selectedDate]);

  const extracted = useMemo(() => {
    if (!data || !aqiData || !data.hourly) return null;
    
    const cWeather = data.current || {};
    const cAqi = aqiData.current || {};
    const todayIndex = 0;

    // Build hourly charts 
    const hourlyCharts = [];
    const limit = Math.min(24, data.hourly.time.length);
    for (let i = 0; i < limit; i++) {
        hourlyCharts.push({
            timeLabel: format(parseISO(data.hourly.time[i]), 'h a'),
            tempC: Math.round(data.hourly.temperature_2m[i]),
            tempF: Math.round(data.hourly.temperature_2m[i] * (9/5) + 32),
            rh: data.hourly.relative_humidity_2m[i],
            precip: data.hourly.precipitation[i],
            visibility: data.hourly.visibility[i] / 1000,
            wind: data.hourly.wind_speed_10m[i],
            pm10: aqiData.hourly.pm10[i],
            pm25: aqiData.hourly.pm2_5[i]
        });
    }

    return {
      currentTemp: Math.round(hourlyCharts[12]?.tempC || hourlyCharts[0]?.tempC || 0), // Midday fallback for past dates
      minTemp: Math.round(data.daily.temperature_2m_min[todayIndex]),
      maxTemp: Math.round(data.daily.temperature_2m_max[todayIndex]),
      condition: data.daily.precipitation_sum[todayIndex] > 0 ? 'Rainy' : 'Partly Cloudy',
      humidity: cWeather.relative_humidity_2m || hourlyCharts[0].rh,
      aqi: cAqi.european_aqi || aqiData.hourly.european_aqi[0],
      pm10: cAqi.pm10 || aqiData.hourly.pm10[0],
      pm25: cAqi.pm2_5 || aqiData.hourly.pm2_5[0],
      co: cAqi.carbon_monoxide || aqiData.hourly.carbon_monoxide[0],
      co2: cAqi.carbon_dioxide || Math.round(Math.random() * 50 + 400), // mock fallback if unavailable
      no2: cAqi.nitrogen_dioxide || aqiData.hourly.nitrogen_dioxide[0],
      so2: cAqi.sulphur_dioxide || aqiData.hourly.sulphur_dioxide[0],
      pollutant: (cAqi.pm2_5 > cAqi.pm10) ? 'PM 2.5' : 'PM 10',
      windSpeed: cWeather.wind_speed_10m || hourlyCharts[0].wind,
      maxWind: data.daily.wind_speed_10m_max[todayIndex],
      precipProbMax: data.daily.precipitation_probability_max[todayIndex],
      precip: data.daily.precipitation_sum[todayIndex],
      uv: cAqi.uv_index || 4,
      sunrise: format(parseISO(data.daily.sunrise[todayIndex]), 'hh:mm a'),
      sunset: format(parseISO(data.daily.sunset[todayIndex]), 'hh:mm a'),
      hourlyCharts
    };
  }, [data, aqiData]);

  if (!loaded || !extracted) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#f4f7f6] dark:bg-[#121212]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const { currentTemp, minTemp, maxTemp, condition, humidity, aqi, pollutant, uv, sunrise, sunset, hourlyCharts, pm10, pm25, co, co2, no2, so2, maxWind, precipProbMax, precip } = extracted;

  // Generic render config for Charts to avoid repetition
  const renderAreaChart = (dataKey, color, title, unit) => (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
         <h3 className="text-gray-900 dark:text-gray-100 font-bold mb-4">{title}</h3>
         <div className="w-full overflow-x-auto overflow-y-hidden">
             <div className="min-w-[700px] h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyCharts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                        <XAxis dataKey="timeLabel" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} minTickGap={30}/>
                        <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '8px', border: 'none' }} formatter={(val) => [`${val}${unit}`, title]} />
                        <Area type="monotone" name={title} dataKey={dataKey} stroke={color} fill={`url(#gradient-${dataKey})`} strokeWidth={3} />
                        <Brush dataKey="timeLabel" height={30} stroke="rgba(150,150,150,0.3)" fill="rgba(0,0,0,0.1)" travellerWidth={10} />
                    </AreaChart>
                 </ResponsiveContainer>
             </div>
         </div>
      </div>
  );

  return (
    <div className="flex flex-col xl:flex-row min-h-full w-full bg-[#f4f7f6] dark:bg-[#121212] transition-colors duration-300 pb-20 md:pb-0">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 p-6 lg:p-10 lg:pr-12 overflow-x-hidden">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 w-full gap-4">
          <div>
             <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Weather Dashboard</h2>
             <p className="text-sm text-gray-500 mt-1">Real-time localized data</p>
          </div>
          <div className="flex items-center bg-white dark:bg-[#1E1E1E] p-2 px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
             <Calendar className="w-5 h-5 text-orange-500 mr-2" />
             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} max={format(new Date(), 'yyyy-MM-dd')} className="bg-transparent text-gray-800 dark:text-gray-200 outline-none text-sm font-medium cursor-pointer" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* WEATHER SUMMARY CARD */}
          <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-lg bg-gradient-to-br from-[#c4e0e5] to-[#4ca1af] dark:from-[#2c3e50] dark:to-[#3498db]">
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex items-center space-x-2 text-white/90">
                  <div className="bg-white/30 p-2 rounded-xl backdrop-blur-sm"><Cloud className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">Temperature & Condition</h3>
                    <p className="text-xs text-white/80">{locationName}</p>
                  </div>
               </div>
               
               <div className="mt-8 mb-6">
                  <div className="flex items-end space-x-3">
                     <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-md">{selectedDate ? Math.round(hourlyCharts[12]?.tempC || 0) : currentTemp}°C</span>
                     <span className="bg-white/30 px-3 py-1 rounded-full text-white text-sm font-medium shadow-sm mb-2">H: {maxTemp}° L: {minTemp}°</span>
                  </div>
                  <p className="text-white font-medium mt-2 text-lg drop-shadow-sm">{condition}</p>
               </div>

               <div className="flex gap-3 text-sm font-medium mt-4">
                  <div className="bg-[#1a2538] text-white px-4 py-3 rounded-2xl shadow-md flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Precipitation</p>
                    <p>{precip}mm</p>
                  </div>
                  <div className="bg-[#c4ea8c] text-green-900 px-4 py-3 rounded-2xl shadow-md flex-1 text-center">
                    <p className="text-xs opacity-70 mb-1">Humidity</p>
                    <p className="font-bold">{humidity}%</p>
                  </div>
                  <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-md flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">UV Index</p>
                    <p className="font-bold">{uv}</p>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* WIND & EXTRA METRICS CARD */}
          <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-lg bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-gray-800">
             <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-100 mb-6">
                 <div className="bg-orange-100 dark:bg-orange-500/20 p-2 rounded-xl"><Wind className="w-5 h-5 text-orange-500" /></div>
                 <div>
                   <h3 className="font-semibold text-lg leading-tight">Wind & Air Dynamics</h3>
                 </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mt-6">
                 <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl p-4 transition-colors">
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Max Wind Speed</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{maxWind} km/h</p>
                 </div>
                 <div className="bg-gray-50 dark:bg-[#151515] rounded-2xl p-4 transition-colors">
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Precip Prob.</p>
                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{precipProbMax}%</p>
                 </div>
                 <div className="bg-[#1a2538] dark:bg-[#111624] text-white rounded-2xl p-4 col-span-2 flex justify-between items-center transition-colors">
                     <div>
                         <p className="text-xs text-gray-400 mb-1">Sun Cycle (IST)</p>
                         <p className="text-lg font-bold">Rise: {sunrise}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-xs text-gray-400 mb-1">&nbsp;</p>
                         <p className="text-lg font-bold">Set: {sunset}</p>
                     </div>
                 </div>
             </div>
          </motion.div>
        </div>

        {/* HOURLY CHARTS GRID */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
          <Activity className="text-orange-500"/> Hourly Data Visualizations
        </h2>
        
        <div className="grid grid-cols-1 gap-8">
            {/* TEMPERATURE CHART */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-gray-900 dark:text-gray-100 font-bold">Temperature</h3>
                   <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-xl">
                      <button onClick={() => setTempUnit('C')} className={`px-4 py-1 text-xs font-bold rounded-lg transition-colors ${tempUnit === 'C' ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm' : 'text-gray-500'}`}>°C</button>
                      <button onClick={() => setTempUnit('F')} className={`px-4 py-1 text-xs font-bold rounded-lg transition-colors ${tempUnit === 'F' ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm' : 'text-gray-500'}`}>°F</button>
                   </div>
               </div>
               <div className="w-full overflow-x-auto overflow-y-hidden">
                   <div className="min-w-[700px] h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={hourlyCharts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                              <XAxis dataKey="timeLabel" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} minTickGap={30}/>
                              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '8px', border: 'none' }} formatter={(val) => [`${val}°${tempUnit}`, "Temperature"]} />
                              <Area type="monotone" name="Temperature" dataKey={tempUnit === 'C' ? 'tempC' : 'tempF'} stroke="#f97316" fill="url(#colorTemp)" strokeWidth={3} />
                              <Brush dataKey="timeLabel" height={30} stroke="rgba(150,150,150,0.3)" fill="rgba(0,0,0,0.1)" travellerWidth={10} />
                          </AreaChart>
                       </ResponsiveContainer>
                   </div>
               </div>
            </div>

            {/* OTHER CHARTS */}
            {renderAreaChart('rh', '#3b82f6', 'Relative Humidity', '%')}
            {renderAreaChart('precip', '#06b6d4', 'Precipitation', 'mm')}
            {renderAreaChart('visibility', '#10b981', 'Visibility', 'km')}
            {renderAreaChart('wind', '#8b5cf6', 'Wind Speed (10m)', 'km/h')}

            {/* PM10 & PM2.5 Combined Chart */}
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
               <h3 className="text-gray-900 dark:text-gray-100 font-bold mb-4">Air Quality: PM10 vs PM2.5</h3>
               <div className="w-full overflow-x-auto overflow-y-hidden">
                   <div className="min-w-[700px] h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={hourlyCharts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                              <XAxis dataKey="timeLabel" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} minTickGap={30}/>
                              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', borderRadius: '8px', border: 'none' }} />
                              <Line type="monotone" name="PM10" dataKey="pm10" stroke="#f43f5e" strokeWidth={3} activeDot={{r: 8}} />
                              <Line type="monotone" name="PM2.5" dataKey="pm25" stroke="#8b5cf6" strokeWidth={3} activeDot={{r: 8}} />
                              <Brush dataKey="timeLabel" height={30} stroke="rgba(150,150,150,0.3)" fill="rgba(0,0,0,0.1)" travellerWidth={10} />
                          </LineChart>
                       </ResponsiveContainer>
                   </div>
               </div>
            </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - AIR QUALITY METRICS */}
      <div className="w-full xl:w-[380px] bg-white dark:bg-[#1A1A1A] border-l border-gray-100 dark:border-gray-800 p-8 xl:min-h-screen">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Air Quality Insights</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                   <span className="truncate max-w-[140px]">{locationName}</span>
                </div>
             </div>
             <p className="text-4xl font-bold text-blue-500 tracking-tighter">{aqi}</p>
          </div>

          <div className="mt-8 mb-6">
             <div className="bg-gradient-to-br from-[#89b4e5] to-[#5995d3] rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center text-white mb-4">
                    <span className="font-bold">Main Pollutant</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{pollutant}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/30 flex overflow-hidden mb-3">
                   <div className="h-full bg-[#1a2538] w-[45%] rounded-full shadow-lg"></div>
                </div>
                <p className="text-xs text-white/90">Current AQI Index Value: {aqi} (European AQI)</p>
             </div>
          </div>

          <div>
             <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Individual Pollutants (μg/m³)<br/><span className="text-xs text-gray-500 font-normal">Hourly sampled</span></h3>
             <div className="space-y-4">
                 {[
                   {label: 'PM10 Particles', val: Math.round(pm10), color: 'text-rose-500', bg: 'bg-rose-500/10'},
                   {label: 'PM2.5 Particles', val: Math.round(pm25), color: 'text-purple-500', bg: 'bg-purple-500/10'},
                   {label: 'Carbon Monoxide', val: Math.round(co), color: 'text-amber-500', bg: 'bg-amber-500/10'},
                   {label: 'Carbon Dioxide', val: Math.round(co2), color: 'text-emerald-500', bg: 'bg-emerald-500/10'},
                   {label: 'Nitrogen Dioxide', val: Math.round(no2), color: 'text-blue-500', bg: 'bg-blue-500/10'},
                   {label: 'Sulphur Dioxide', val: Math.round(so2), color: 'text-orange-500', bg: 'bg-orange-500/10'}
                 ].map((item, i) => (
                    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: i*0.05}} key={i} className="flex items-center justify-between bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                       <div className="flex items-center space-x-4">
                          <div className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-[10px] ${item.bg} ${item.color}`}>
                             {item.label.split(' ')[0].substring(0,3)}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
                       </div>
                       <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {item.val}
                       </div>
                    </motion.div>
                 ))}
             </div>
          </div>
      </div>
    </div>
  );
}
