
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
import { mockUser } from './constants';
import type { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setActiveView={setCurrentView} />;
      case 'finance':
        return <Finance />;
      case 'inventory':
        return <Inventory />;
      case 'meal_planner':
        return <MealPlanner />;
      case 'recipes':
        return <Recipes />;
      case 'savings':
        return <Savings />;
      case 'receipt_parser':
        return <ReceiptParser />;
      default:
        return <Dashboard setActiveView={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={mockUser} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
