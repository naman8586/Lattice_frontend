import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Compass, Calendar, Map, Settings, Grid, Moon, Sun, Search, Bell } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Historical from './pages/Historical';

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="flex h-screen w-full bg-[#f4f7f6] dark:bg-[#121212] transition-colors duration-300 overflow-hidden font-sans">
        
        {/* LEFT SIDEBAR (Thin Navigation) */}
        <aside className="w-20 hidden md:flex flex-col items-center py-8 bg-white dark:bg-[#1A1A1A] border-r border-gray-100 dark:border-gray-800 shadow-sm z-50">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex justify-center items-center mb-12 shadow-md shadow-orange-500/30">
             <span className="text-white font-bold text-lg">W</span>
          </div>
          <nav className="flex-1 flex flex-col space-y-8">
            <NavLink to="/" className={({isActive}) => `p-3 rounded-xl transition-all ${isActive ? 'bg-orange-500/10 text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}>
               <Grid className="w-5 h-5" />
            </NavLink>
            <NavLink to="/historical" className={({isActive}) => `p-3 rounded-xl transition-all ${isActive ? 'bg-orange-500/10 text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}>
               <Calendar className="w-5 h-5" />
            </NavLink>
          </nav>
          
          <button onClick={toggleTheme} className="p-3 text-gray-400 hover:text-yellow-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full">
             {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </aside>

        {/* MAIN APP AREA (Scrollable) */}
        <main className="flex-1 h-full overflow-y-auto w-full pb-20 md:pb-0">
           <Routes>
             <Route path="/" element={<Dashboard theme={theme} />} />
             <Route path="/historical" element={<Historical theme={theme} />} />
           </Routes>
        </main>

        {/* BOTTOM NAVIGATION (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-gray-800 flex justify-around items-center p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
          <NavLink to="/" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}>
            <Grid className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </NavLink>
          <NavLink to="/historical" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}>
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">History</span>
          </NavLink>
          <button onClick={toggleTheme} className="flex flex-col items-center p-2 rounded-xl text-gray-400 hover:text-yellow-500 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
            <span className="text-[10px] font-medium">Theme</span>
          </button>
        </nav>

      </div>
    </Router>
  );
}

export default App;