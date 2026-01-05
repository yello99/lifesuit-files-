import React from 'react';
import { View } from '../../App';
import { DashboardIcon, HistoryIcon, AchievementsIcon, CoachIcon, MenuIcon } from '../icons/FeatureIcons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// FIX: Extracted inline props to a dedicated interface to solve TS error with 'key' prop.
interface NavItemProps {
  icon: React.ReactNode, 
  label: string, 
  isActive: boolean, 
  onClick: () => void, 
  isSidebarOpen: boolean
}

// FIX: Wrapped component in React.memo to fix TypeScript error with the 'key' prop.
const NavItem = React.memo(({ icon, label, isActive, onClick, isSidebarOpen }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-3 my-2 rounded-lg transition-all duration-200 ${
      isActive ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-text-dark hover:bg-brand-bg-light hover:text-brand-text-light'
    }`}
    aria-label={label}
  >
    {icon}
    <span className={`ml-4 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
  </button>
));

const Sidebar = ({ activeView, setActiveView, isOpen, setIsOpen }: SidebarProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { id: 'history', label: 'Session History', icon: <HistoryIcon className="w-6 h-6" /> },
    { id: 'achievements', label: 'Achievements', icon: <AchievementsIcon className="w-6 h-6" /> },
    { id: 'coach', label: 'AI Coach', icon: <CoachIcon className="w-6 h-6" /> },
  ];

  return (
    <div className={`fixed top-0 left-0 h-full bg-brand-bg-light shadow-2xl z-10 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 h-20 border-b border-gray-700">
          <div className={`flex items-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-2xl font-extrabold text-white">Life<span className="text-brand-secondary">Suit</span></h1>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-brand-text-dark hover:text-white">
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.id}
              onClick={() => setActiveView(item.id as View)}
              isSidebarOpen={isOpen}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;