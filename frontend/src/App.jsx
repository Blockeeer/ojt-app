import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Settings from './pages/Settings';
import { STORAGE_KEYS } from './hooks/useLocalStorage';
import { DEFAULT_SETTINGS, DEFAULT_SCHEDULE } from './data/defaults';
import { DEFAULT_HOLIDAYS } from './data/philippineHolidays';

export default function App() {
  // Seed localStorage with defaults on first run only
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOLIDAYS)) {
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(DEFAULT_HOLIDAYS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULE)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(DEFAULT_SCHEDULE));
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="max-w-2xl mx-auto px-4 pb-24 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
      <Navbar />
    </BrowserRouter>
  );
}
