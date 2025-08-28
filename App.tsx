
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Inventory from './components/Inventory';
import MealPlanner from './components/MealPlanner';
import Recipes from './components/Recipes';
import Savings from './components/Savings';
import ReceiptParser from './components/ReceiptParser';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Announcements from './components/Announcements';
import type { View, InventoryItem, MealPlan } from './types';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { mockInventory, mockMealPlan as initialMockMealPlan } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Lifted state for inventory and meal plans to manage them globally
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [mealPlan, setMealPlan] = useState<MealPlan[]>(initialMockMealPlan);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setActiveView={setCurrentView} inventory={inventory} />;
      case 'finance':
        return <Finance />;
      case 'inventory':
        return <Inventory inventory={inventory} setInventory={setInventory} />;
      case 'meal_planner':
        return <MealPlanner 
                  mealPlan={mealPlan} 
                  setMealPlan={setMealPlan} 
                  inventory={inventory} 
                  setInventory={setInventory} 
                />;
      case 'recipes':
        return <Recipes />;
      case 'savings':
        return <Savings />;
      case 'announcements':
        return <Announcements />;
      case 'receipt_parser':
        return <ReceiptParser />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setActiveView={setCurrentView} inventory={inventory} />;
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex h-screen bg-slate-100 font-sans dark:bg-slate-900">
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header setCurrentView={setCurrentView} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8 print:overflow-visible print:p-0 print:bg-white dark:bg-slate-900">
              {renderView()}
            </main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;