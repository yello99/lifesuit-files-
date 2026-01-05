import React, { useState } from 'react';
import { useHardwareConnection } from './hooks/useMockHardware';
import SessionSummaryModal from './components/SessionSummaryModal';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/views/Dashboard';
import SessionHistory from './components/views/SessionHistory';
import Achievements from './components/views/Achievements';
import AICoach from './components/views/AICoach';

export type View = 'dashboard' | 'history' | 'achievements' | 'coach';

const App = (): React.ReactNode => {
  const hardware = useHardwareConnection();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard {...hardware} />;
      case 'history':
        return <SessionHistory sessionHistory={hardware.sessionHistory} />;
      case 'achievements':
        return <Achievements achievements={hardware.achievements} />;
      case 'coach':
        return <AICoach lastSession={hardware.sessionHistory[0] || null} />;
      default:
        return <Dashboard {...hardware} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>

      <SessionSummaryModal 
        summary={hardware.lastSessionSummary} 
        onClose={() => hardware.setLastSessionSummary(null)} 
      />
    </div>
  );
};

export default App;
