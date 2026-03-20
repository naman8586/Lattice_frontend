import React, { useState } from 'react';
import { fetchHistoricalData } from '../services/openMeteo';
// Ensure the filename matches: if your file is HourlyChart.jsx, remove the 's'
import HourlyChart from '../components/charts/HourlyCharts'; 

const HistoricalData = ({ coords, unit }) => {
  const [dates, setDates] = useState({ start: '', end: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Today is March 20, 2026. Archive data has a processing lag.
  // We restrict the calendar to 5 days ago to prevent 400 Bad Request errors.
  const today = new Date();
  today.setDate(today.getDate() - 5);
  const maxAllowedDate = today.toISOString().split('T')[0];

  const handleSearch = async () => {
    if (!dates.start || !dates.end) return alert("Please select both dates");
    
    const startDate = new Date(dates.start);
    const endDate = new Date(dates.end);

    if (startDate > endDate) {
      return alert("Start date cannot be after end date.");
    }

    // Requirement Check: Maximum 2-year range
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 730) return alert("Please select a range within 2 years.");

    setLoading(true);
    try {
      const res = await fetchHistoricalData(coords.latitude, coords.longitude, dates.start, dates.end);
      
      if (!res || !res.daily) {
        throw new Error("The API returned no data for this range. Try an older date.");
      }

      const formatted = res.daily.time.map((t, i) => ({
        time: t,
        maxTemp: unit === 'celsius' 
          ? res.daily.temperature_2m_max[i] 
          : ((res.daily.temperature_2m_max[i] * 9/5) + 32).toFixed(1),
        minTemp: unit === 'celsius' 
          ? res.daily.temperature_2m_min[i] 
          : ((res.daily.temperature_2m_min[i] * 9/5) + 32).toFixed(1),
        precip: res.daily.precipitation_sum[i],
        // Requirement: Sunrise/Sunset conversion to IST
        sunrise: new Date(res.daily.sunrise[i]).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
        sunset: new Date(res.daily.sunset[i]).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
      }));
      
      setData(formatted);
    } catch (error) {
      console.error("Historical fetch failed:", error);
      alert(error.message || "Failed to fetch historical data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-600 mb-2">Start Date</label>
          <input 
            type="date" 
            max={maxAllowedDate}
            onChange={(e) => setDates({...dates, start: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-slate-600 mb-2">End Date</label>
          <input 
            type="date" 
            max={maxAllowedDate}
            onChange={(e) => setDates({...dates, end: e.target.value})}
            className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
          />
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className={`px-8 py-2.5 rounded-lg font-bold text-white transition-all ${
            loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {loading ? "Fetching..." : "Analyze Trends"}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 gap-8">
          <HourlyChart
            title="Historical Max Temperature" 
            data={data} 
            dataKey="maxTemp" 
            unit={unit === 'celsius' ? '°C' : '°F'} 
            color="#f59e0b" 
          />
          <HourlyChart
            title="Historical Precipitation" 
            data={data} 
            dataKey="precip" 
            unit="mm" 
            color="#3b82f6" 
          />
        </div>
      )}
    </div>
  );
};

export default HistoricalData;