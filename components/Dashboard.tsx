
import React from 'react';
import Card from './Card';
import { mockTransactions, mockFinanceCategories } from '../constants';
import { TransactionType, Role } from '../types';
import type { View, InventoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../services/ThemeContext';
import { WalletIcon, InventoryIcon, MealPlannerIcon, ReceiptIcon } from '../icons/IconComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  setActiveView: (view: View) => void;
  inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView, inventory }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const canEdit = user.role === Role.Admin || user.role === Role.Editor;

  const totalIncome = mockTransactions
    .filter(t => t.type === TransactionType.Income)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = mockTransactions
    .filter(t => t.type === TransactionType.Expense)
    .reduce((acc, t) => acc + t.amount, 0);

  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);

  const todaysPlan = { date: '2024-07-29' }; // Mocking today for demo

  const expenseData = mockTransactions
    .filter(t => t.type === TransactionType.Expense)
    .reduce((acc, t) => {
        const category = mockFinanceCategories.find(c => c.categoryId === t.categoryId);
        const categoryName = category ? category.name : 'Uncategorized';
        const existing = acc.find(item => item.name === categoryName);
        if (existing) {
            existing.expense += t.amount / 100;
        } else {
            acc.push({ name: categoryName, expense: t.amount / 100 });
        }
        return acc;
    }, [] as { name: string; expense: number }[]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Welcome back, {user.name.split(' ')[0]}!</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full"><WalletIcon className="w-6 h-6 text-green-600" /></div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Income</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">Ksh {(totalIncome / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-full"><WalletIcon className="w-6 h-6 text-red-600" /></div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">Ksh {(totalExpense / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full"><InventoryIcon className="w-6 h-6 text-yellow-600" /></div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Low Stock Items</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{lowStockItems.length}</p>
            </div>
        </Card>
        <Card className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full"><MealPlannerIcon className="w-6 h-6 text-blue-600" /></div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Meals Planned Today</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{todaysPlan ? 3 : 0}</p>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Expense Breakdown" className="lg:col-span-2">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                        <YAxis tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} formatter={(value: number) => `Ksh ${value.toFixed(2)}`}/>
                        <Bar dataKey="expense" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
        
        {canEdit && (
            <Card title="Quick Actions">
                <div className="space-y-4">
                    <button onClick={() => setActiveView('finance')} className="w-full flex items-center justify-center py-3 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                        <WalletIcon className="w-5 h-5 mr-2" /> Add Transaction
                    </button>
                    <button onClick={() => setActiveView('inventory')} className="w-full flex items-center justify-center py-3 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                        <InventoryIcon className="w-5 h-5 mr-2" /> Add Inventory Item
                    </button>
                    <button onClick={() => setActiveView('receipt_parser')} className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-600">
                        <ReceiptIcon className="w-5 h-5 mr-2" /> Scan a Receipt
                    </button>
                </div>
            </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;