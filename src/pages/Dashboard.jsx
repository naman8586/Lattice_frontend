import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { Sun, Cloud, CloudRain, Wind, Droplets, MapPin, Search, Bell, Eye, Navigation, ChevronDown, Thermometer, Calendar } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

import { useGeolocation } from '../hooks/useGeolocation';
import { fetchWeatherForecast, fetchAirQuality, fetchLocationName } from '../services/api';

export default function Dashboard({ theme }) {
  const { latitude, longitude, loaded, error } = useGeolocation();
  const [data, setData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [locationName, setLocationName] = useState('Locating...');

  useEffect(() => {
    if (!loaded || !latitude || !longitude) return;
    const loadData = async () => {
      try {
        const [weatherRes, aqiRes, locName] = await Promise.all([
          fetchWeatherForecast(latitude, longitude),
          fetchAirQuality(latitude, longitude),
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
  }, [loaded, latitude, longitude]);

  const extracted = useMemo(() => {
    if (!data || !aqiData) return null;
    
    const tz = data.timezone || 'auto';
    const cWeather = data.current;
    const cAqi = aqiData.current;
    
    // For today's temps
    const todayIndex = 0; 
    const tomorrowIndex = 1;

    // Build today temperature chart (Morning, Afternoon, Evening, Night) 
    // We'll sample 06:00, 12:00, 18:00, 22:00
    const todayStr = data.daily.time[0];
    const getTempAtHour = (hour) => {
      const idx = data.hourly.time.findIndex(t => t === `${todayStr}T${hour}:00`);
      return idx !== -1 ? Math.round(data.hourly.temperature_2m[idx]) : 0;
    };
    const chartData = [
      { name: 'Morning', temp: getTempAtHour('08') },
      { name: 'Afternoon', temp: getTempAtHour('14') },
      { name: 'Evening', temp: getTempAtHour('18') },
      { name: 'Night', temp: getTempAtHour('22') }
    ];

    // Predictions
    const predictions = [];
    for (let i = 1; i <= 5; i++) {
       if (data.daily.time[i]) {
         predictions.push({
           date: format(parseISO(data.daily.time[i]), 'MMMM d'),
           condition: data.daily.precipitation_sum[i] > 1 ? 'Rainy' : (data.daily.weather_code[i] <= 3 ? (data.daily.weather_code[i] === 0 ? 'Bright' : 'Cloudy') : 'Rainy'),
           high: Math.round(data.daily.temperature_2m_max[i]),
           low: Math.round(data.daily.temperature_2m_min[i])
         });
       }
    }

    return {
      currentTemp: Math.round(cWeather.temperature_2m),
      minTemp: Math.round(data.daily.temperature_2m_min[todayIndex]),
      condition: cWeather.precipitation > 0 ? 'Rainy' : 'Partly Cloudy',
      pressure: cWeather.surface_pressure || 800, // mock fallback if undefined
      visibility: data.hourly.visibility[0] ? (data.hourly.visibility[0] / 1000).toFixed(1) : 4.3,
      humidity: cWeather.relative_humidity_2m,
      aqi: cAqi.european_aqi || 50,
      pollutant: cAqi.pm2_5 > cAqi.pm10 ? 'PM 2.5' : 'PM 10',
      windSpeed: cWeather.wind_speed_10m,
      windDir: cWeather.wind_direction_10m > 180 ? 'West Wind' : 'East Wind',
      uv: cAqi.uv_index || 4,
      sunrise: format(parseISO(data.daily.sunrise[todayIndex]), 'hh:mm a'),
      sunset: format(parseISO(data.daily.sunset[todayIndex]), 'hh:mm a'),
      tomorrowHigh: Math.round(data.daily.temperature_2m_max[tomorrowIndex]),
      tomorrowCondition: data.daily.precipitation_sum[tomorrowIndex] > 1 ? 'Rainy' : 'Cloudy',
      chartData,
      predictions
    };
  }, [data, aqiData]);

  if (!loaded || !extracted) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const { currentTemp, minTemp, condition, pressure, visibility, humidity, aqi, pollutant, windDir, uv, sunrise, sunset, tomorrowHigh, tomorrowCondition, chartData, predictions } = extracted;

  return (
    <div className="flex flex-col xl:flex-row min-h-full w-full bg-[#f4f7f6] dark:bg-[#121212] text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 p-6 lg:p-10 lg:pr-12">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-10 w-full max-w-4xl mx-auto xl:mx-0">
          <div>
             <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Weather Dashboard</h2>
          </div>
        </header>

        <div className="max-w-4xl mx-auto xl:mx-0 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* WEATHER CARD */}
          <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-lg bg-gradient-to-br from-[#c4e0e5] to-[#4ca1af] dark:from-[#2c3e50] dark:to-[#3498db]">
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex items-center space-x-2 text-white/90">
                  <div className="bg-white/30 p-2 rounded-xl backdrop-blur-sm"><Cloud className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">Weather</h3>
                    <p className="text-xs text-white/80">What's the weather.</p>
                  </div>
               </div>
               
               <div className="mt-8 mb-6">
                  <div className="flex items-end space-x-3">
                     <span className="text-6xl font-bold text-white tracking-tighter shadow-black/10 drop-shadow-md">{currentTemp}°C</span>
                     <span className="bg-white/30 dark:bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-medium shadow-sm mb-2">{minTemp}°C</span>
                  </div>
                  <p className="text-white font-medium mt-2 text-lg drop-shadow-sm">{condition}</p>
               </div>

               <div className="flex gap-3 text-sm font-medium mt-4">
                  <div className="bg-[#1a2538] text-white px-5 py-3 rounded-2xl shadow-md flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Pressure</p>
                    <p>{pressure}mb</p>
                  </div>
                  <div className="bg-[#c4ea8c] text-green-900 px-5 py-3 rounded-2xl shadow-md flex-1 text-center">
                    <p className="text-xs opacity-70 mb-1">Visibility</p>
                    <p className="font-bold">{visibility} km</p>
                  </div>
                  <div className="bg-white dark:bg-[#1E1E1E] text-gray-800 dark:text-gray-200 px-5 py-3 rounded-2xl shadow-md flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Humidity</p>
                    <p>{humidity}%</p>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* AIR QUALITY CARD */}
          <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-lg bg-gradient-to-br from-[#89b4e5] to-[#5995d3] dark:from-[#1b3a5b] dark:to-[#17446e]">
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex items-center space-x-2 text-white/90">
                  <div className="bg-white/30 p-2 rounded-xl backdrop-blur-sm"><Wind className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">Air Quality</h3>
                    <p className="text-xs text-white/80">Main pollutant : {pollutant}</p>
                  </div>
               </div>
               
               <div className="mt-10 mb-8">
                  <div className="flex items-end space-x-3">
                     <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-md">{aqi}</span>
                     <span className="bg-[#c4ea8c] text-green-900 px-2 py-1 rounded-lg text-xs font-bold mb-3 shadow-sm">AQI</span>
                  </div>
                  <p className="text-white font-medium mt-2">{windDir}</p>
               </div>

               <div className="mt-auto bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-4 shadow-inner">
                  <div className="flex justify-between text-xs text-white/90 font-medium mb-2 px-1">
                     <span>Good</span>
                     <span className="bg-[#1a2538] text-white px-3 py-1 rounded-full -mt-2 shadow-lg">Standard</span>
                     <span>Hazardous</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/30 flex overflow-hidden">
                     <div className="h-full bg-orange-400 w-1/2 rounded-full"></div>
                  </div>
               </div>
            </div>
          </motion.div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="max-w-4xl mx-auto xl:mx-0 grid grid-cols-1 lg:grid-cols-5 gap-8 mt-10">
           
           {/* Line Chart Area */}
           <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="lg:col-span-3 bg-white dark:bg-[#1E1E1E] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold">How's the<br/>temperature today?</h3>
                 <div className="flex space-x-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white"><Thermometer className="w-5 h-5"/></div>
                    <div className="w-10 h-10 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"><CloudRain className="w-5 h-5"/></div>
                    <div className="w-10 h-10 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"><Wind className="w-5 h-5"/></div>
                 </div>
              </div>
              
              <div className="h-40 w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{top: 20, right: 30, left: 30, bottom: 5}}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 13, dy: 15}} />
                       <Tooltip cursor={false} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                       <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={4} dot={{r: 6, fill: '#f97316', strokeWidth: 3, stroke: '#fff'}} activeDot={{r: 8, fill: '#1a2538', stroke: '#f97316', strokeWidth: 3}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="flex justify-between px-8 mt-4">
                 {chartData.map((d,i) => (
                    <div key={i} className="text-center">
                       <p className="text-lg font-bold">{d.temp}°</p>
                    </div>
                 ))}
              </div>
           </motion.div>

           {/* Tomorrow Card */}
           <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} className="lg:col-span-2 bg-gradient-to-br from-[#dce8bd] to-[#b6c78c] dark:from-[#3a4f29] dark:to-[#2b3a1a] rounded-[2rem] p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div>
                 <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Tomorrow</p>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Alam Barzah</h3>
              </div>
              <div className="mt-16 z-10">
                 <h2 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tighter">{tomorrowHigh}°C</h2>
                 <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-1">{tomorrowCondition}</p>
              </div>
              {/* Decorative rain/umbrella visual cue (icon based) */}
              <div className="absolute -right-4 -bottom-4 opacity-50 text-white">
                 <CloudRain className="w-48 h-48" />
              </div>
           </motion.div>

        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-full xl:w-[380px] bg-white dark:bg-[#1A1A1A] border-l border-gray-100 dark:border-gray-800 p-8 xl:min-h-screen">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sun</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                   <span className="truncate max-w-[140px]">{locationName}</span>
                </div>
             </div>
             <p className="text-4xl font-bold text-orange-500 tracking-tighter">{currentTemp}°C</p>
          </div>

          {/* Sun Cycle Arc */}
          <div className="relative w-full aspect-[2/1] mt-10 mb-6 flex justify-center">
             <svg width="100%" height="100%" viewBox="0 0 200 100" className="overflow-visible">
                {/* Arc path */}
                <path d="M 20 90 A 70 70 0 0 1 180 90" fill="none" stroke="url(#arcGradient)" strokeWidth="3" strokeDasharray="6 6" className="dark:opacity-50" />
                {/* Gradient def */}
                <defs>
                   <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fca5a5" />
                      <stop offset="50%" stopColor="#fcd34d" />
                      <stop offset="100%" stopColor="#fca5a5" />
                   </linearGradient>
                </defs>
                {/* Current Sun Point (simulated near middle for demo) */}
                <circle cx="100" cy="20" r="6" fill="#f59e0b" stroke="#fff" strokeWidth="3" className="shadow-lg" />
                {/* Baseline */}
                <line x1="10" y1="90" x2="190" y2="90" stroke="#e5e7eb" strokeWidth="2" className="dark:stroke-gray-700" />
                <circle cx="20" cy="90" r="4" fill="#f59e0b" />
                <circle cx="180" cy="90" r="4" fill="#f59e0b" />
             </svg>
             <div className="absolute bottom-[-24px] w-full flex justify-between px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <div className="text-center">
                   <p>Sunset</p>
                   <p className="text-gray-800 dark:text-gray-200">{sunset}</p>
                </div>
                <div className="text-center">
                   <p>Sunrise</p>
                   <p className="text-gray-800 dark:text-gray-200">{sunrise}</p>
                </div>
             </div>
          </div>

          <div className="mt-14 mb-10">
             <div className="bg-[#1a2538] dark:bg-[#111624] rounded-2xl p-5 flex items-center shadow-lg transform transition-transform hover:scale-105">
                <Sun className="w-8 h-8 text-yellow-400 mr-4" />
                <div>
                   <div className="flex items-center space-x-3">
                      <span className="text-white text-xl font-bold">{uv} UVI</span>
                      <span className="bg-[#c4ea8c] text-green-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">Moderate</span>
                   </div>
                   <p className="text-gray-400 text-xs mt-1">Moderate risk of from UV rays</p>
                </div>
             </div>
          </div>

          <div>
             <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Weather Prediction</h3>
             <div className="space-y-4">
                {predictions.map((p, i) => (
                   <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: 0.4 + i*0.1}} key={i} className="flex items-center justify-between bg-white dark:bg-[#252525] p-4 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center space-x-4">
                         {p.condition === 'Bright' ? <Sun className="w-8 h-8 text-yellow-500" /> : <CloudRain className="w-8 h-8 text-blue-400" />}
                         <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">{p.date}</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{p.condition}</p>
                         </div>
                      </div>
                      <div className="text-sm font-bold">
                         <span className="text-gray-800 dark:text-gray-200">{p.high}°</span>
                         <span className="text-gray-400 mx-1">/</span>
                         <span className="text-gray-400">{p.low}°</span>
                      </div>
                   </motion.div>
                ))}
             </div>
          </div>
      </div>
    </div>
  );
}
