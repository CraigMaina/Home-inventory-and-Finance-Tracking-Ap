
import React from 'react';
import type { View } from '../types';
import { 
  DashboardIcon, WalletIcon, InventoryIcon, MealPlannerIcon, 
  RecipeIcon, SavingsIcon, ReceiptIcon, SparklesIcon 
} from './icons/IconComponents';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: View;
  currentView: View;
  onClick: (view: View) => void;
  isSpecial?: boolean;
}> = ({ icon, label, view, currentView, onClick, isSpecial = false }) => {
  const isActive = currentView === view;
  const activeClasses = isSpecial 
    ? 'bg-indigo-600 text-white' 
    : 'bg-slate-200 text-slate-800';
  const inactiveClasses = isSpecial
    ? 'bg-indigo-500 text-indigo-100 hover:bg-indigo-600'
    : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800';
  
  return (
    <button
      onClick={() => onClick(view)}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const mainNavItems = [
    { view: 'dashboard' as View, label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
    { view: 'finance' as View, label: 'Finance', icon: <WalletIcon className="w-5 h-5" /> },
    { view: 'inventory' as View, label: 'Inventory', icon: <InventoryIcon className="w-5 h-5" /> },
    { view: 'meal_planner' as View, label: 'Meal Planner', icon: <MealPlannerIcon className="w-5 h-5" /> },
    { view: 'recipes' as View, label: 'Recipes', icon: <RecipeIcon className="w-5 h-5" /> },
    { view: 'savings' as View, label: 'Savings Goals', icon: <SavingsIcon className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white flex-shrink-0 p-4 border-r border-slate-200 flex flex-col">
      <div className="flex items-center mb-8">
        <div className="bg-slate-800 p-2 rounded-lg">
          <WalletIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 ml-3">HouseholdOS</h1>
      </div>
      
      <nav className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu</h2>
          <ul className="space-y-2">
            {mainNavItems.map(item => (
              <li key={item.view}>
                <NavLink 
                  view={item.view} 
                  label={item.label}
                  icon={item.icon}
                  currentView={currentView}
                  onClick={setCurrentView}
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
            <div className="mb-4">
                <NavLink 
                    view="receipt_parser"
                    label="Scan Receipt"
                    icon={<ReceiptIcon className="w-5 h-5" />}
                    currentView={currentView}
                    onClick={setCurrentView}
                    isSpecial={true}
                />
            </div>
            <div className="text-center text-xs text-slate-400">
                <p>&copy; 2024 HouseholdOS</p>
                <p>All rights reserved.</p>
            </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
