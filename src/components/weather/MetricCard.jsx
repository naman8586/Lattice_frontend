import React from 'react';

const MetricCard = ({ title, value, unit, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        <span className="text-slate-400 text-sm font-medium">{unit}</span>
      </div>
    </div>
  );
};

export default MetricCard;