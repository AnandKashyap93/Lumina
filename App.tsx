import React, { useState, useEffect } from 'react';
import { AppView, CalibrationData } from './types';
import { Landing } from './components/Landing';
import { Calibration } from './components/Calibration';
import { Dashboard } from './components/Dashboard';
import { Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleStart = () => {
    setView(AppView.CALIBRATION);
  };

  const handleCalibrationComplete = (data: CalibrationData) => {
    setCalibrationData(data);
    setView(AppView.DASHBOARD);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-lumina-darkBg text-lumina-darkText' : 'bg-lumina-bg text-lumina-text'} overflow-x-hidden`}>
      {/* Global Theme Toggle (visible on all screens top-right) */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 ${
            isDarkMode ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {view === AppView.LANDING && (
        <Landing onStart={handleStart} isDarkMode={isDarkMode} />
      )}
      
      {view === AppView.CALIBRATION && (
        <Calibration onComplete={handleCalibrationComplete} />
      )}
      
      {view === AppView.DASHBOARD && (
        <Dashboard calibration={calibrationData} isDarkMode={isDarkMode} />
      )}
    </div>
  );
};

export default App;
