import { NavLink } from 'react-router-dom';
import { CloudRain, History } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 text-white font-bold text-xl">
            <CloudRain className="w-6 h-6 text-blue-400" />
            <span>Weather Insights</span>
          </div>
          <div className="flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <CloudRain className="w-4 h-4" />
              <span>Current</span>
            </NavLink>
            <NavLink
              to="/historical"
              className={({ isActive }) =>
                `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <History className="w-4 h-4" />
              <span>Historical</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
