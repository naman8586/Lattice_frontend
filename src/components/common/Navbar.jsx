import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="flex gap-2 bg-slate-200 p-1 rounded-xl mb-8 w-fit">
      <button
        onClick={() => setActiveTab('current')}
        className={`px-6 py-2 rounded-lg font-medium transition-all ${
          activeTab === 'current' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Current & Hourly
      </button>
      <button
        onClick={() => setActiveTab('historical')}
        className={`px-6 py-2 rounded-lg font-medium transition-all ${
          activeTab === 'historical' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Historical Trends (2Y)
      </button>
    </nav>
  );
};

export default Navbar;