
import React, { useState, useEffect, useRef } from 'react';
import { Role, View } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, SettingsIcon, LogoutIcon, ChevronDownIcon } from '../icons/IconComponents';

const getRoleDisplayName = (role: Role) => {
  switch (role) {
    case Role.Admin:
      return 'Administrator';
    case Role.Editor:
      return 'Editor';
    case Role.Viewer:
      return 'Viewer';
    default:
      return 'User';
  }
};

interface HeaderProps {
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ setCurrentView }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <header className="bg-white h-16 flex items-center justify-end px-8 border-b border-slate-200 print:hidden dark:bg-slate-800 dark:border-slate-700">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-colors dark:hover:bg-slate-700"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
          />
          <div className="text-right">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getRoleDisplayName(user.role)}</p>
          </div>
          <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10 dark:bg-slate-700 dark:border-slate-600">
            <button
                onClick={() => { setCurrentView('profile'); setIsDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center dark:text-slate-200 dark:hover:bg-slate-600"
            >
                <UserIcon className="w-5 h-5 mr-3" />
                My Profile
            </button>
            <button
                onClick={() => { setCurrentView('settings'); setIsDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center dark:text-slate-200 dark:hover:bg-slate-600"
            >
                <SettingsIcon className="w-5 h-5 mr-3" />
                Settings
            </button>
            <div className="border-t border-slate-200 my-1 dark:border-slate-600"></div>
            <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center dark:hover:bg-red-900/20"
            >
                <LogoutIcon className="w-5 h-5 mr-3" />
                Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
