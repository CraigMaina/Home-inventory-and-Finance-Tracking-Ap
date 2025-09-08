

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Inventory from './components/Inventory';
import MealPlanner from './components/MealPlanner';
import Recipes from './components/Recipes';
import Savings from './components/Savings';
import ReceiptParser from './icons/ReceiptParser';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Announcements from './components/Announcements';
import UserManagement from './components/UserManagement';
import Bills from './components/Bills';
import type { View, InventoryItem, MealPlan, Transaction, FinanceCategory, Bill, InventoryCategory } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './services/ThemeContext';
import { mockInventory, mockMealPlan as initialMockMealPlan, mockTransactions, mockFinanceCategories, mockBills, mockInventoryCategories } from './constants';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';

// The main application content, only rendered when logged in
const MainApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    // Lifted state for shared data
    const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
    const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>(mockInventoryCategories);
    const [mealPlan, setMealPlan] = useState<MealPlan[]>(initialMockMealPlan);
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>(mockFinanceCategories);
    const [bills, setBills] = useState<Bill[]>(mockBills);


    const renderView = () => {
        switch (currentView) {
          case 'dashboard':
            return <Dashboard setActiveView={setCurrentView} inventory={inventory} />;
          case 'finance':
            return <Finance 
                        transactions={transactions} 
                        setTransactions={setTransactions} 
                        categories={financeCategories}
                        setCategories={setFinanceCategories}
                        bills={bills}
                    />;
          case 'inventory':
            return <Inventory 
                        inventory={inventory} 
                        setInventory={setInventory} 
                        categories={inventoryCategories}
                        setCategories={setInventoryCategories}
                    />;
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
          case 'user_management':
            return <UserManagement />;
          case 'bills':
            return <Bills 
                        bills={bills}
                        setBills={setBills}
                        transactions={transactions}
                        setTransactions={setTransactions}
                        financeCategories={financeCategories} 
                    />;
          default:
            return <Dashboard setActiveView={setCurrentView} inventory={inventory} />;
        }
    };
    
    return (
        <div className="flex h-screen bg-slate-100 font-sans dark:bg-slate-900 print:block print:h-auto">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
                <Header setCurrentView={setCurrentView} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8 print:overflow-visible print:p-0 print:bg-white dark:bg-slate-900">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

// The component that decides whether to show auth pages or the main app
const AppContent: React.FC = () => {
    const { user } = useAuth();
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');
    
    if (!user) {
        if (authView === 'login') {
            return <Login setAuthView={setAuthView} />;
        } else {
            return <SignUp setAuthView={setAuthView} />;
        }
    }

    return <MainApp />;
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;