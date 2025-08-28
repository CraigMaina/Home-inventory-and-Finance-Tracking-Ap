import React, { useState } from 'react';
import Card from './Card';
import { mockSavingsGoals } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import type { SavingsGoal } from '../types';

const defaultNewGoal: Omit<SavingsGoal, 'goalId' | 'currentAmount'> = {
    name: '',
    targetAmount: 1000,
    deadline: new Date().toISOString().slice(0, 10),
};

const Savings: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user.role === Role.Admin || user.role === Role.Editor;
  const [goals, setGoals] = useState<SavingsGoal[]>(mockSavingsGoals);

  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(defaultNewGoal);

  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [fundsToAdd, setFundsToAdd] = useState(0);

  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || newGoal.targetAmount <= 0) {
      alert('Please provide a valid name and target amount.');
      return;
    }
    const goalToAdd: SavingsGoal = {
      ...newGoal,
      goalId: `g${Date.now()}`,
      currentAmount: 0,
    };
    setGoals(prev => [goalToAdd, ...prev]);
    setNewGoal(defaultNewGoal);
    setIsAddGoalModalOpen(false);
    showSuccess('New goal created successfully!');
  };

  const handleOpenAddFunds = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFundsToAdd(0);
    setIsAddFundsModalOpen(true);
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || fundsToAdd <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    setGoals(prevGoals =>
      prevGoals.map(g =>
        g.goalId === editingGoal.goalId
          ? { ...g, currentAmount: g.currentAmount + fundsToAdd }
          : g
      )
    );
    setIsAddFundsModalOpen(false);
    setEditingGoal(null);
    showSuccess(`Ksh ${fundsToAdd.toLocaleString()} added to "${editingGoal.name}"!`);
  };

  const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
        <Card className="w-full max-w-md relative" title={title}>
          <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">&times;</button>
          {children}
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Savings Goals</h1>
        <div className="flex items-center gap-4">
            {successMessage && <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>}
            {canEdit && (
            <button onClick={() => setIsAddGoalModalOpen(true)} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                Create New Goal
            </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card key={goal.goalId}>
              <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{goal.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{progress.toFixed(0)}%</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Ksh {goal.currentAmount.toLocaleString()}</span>
                    <span>Ksh {goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              {canEdit && (
                <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 text-right">
                    <button onClick={() => handleOpenAddFunds(goal)} className="bg-indigo-100 text-indigo-800 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors text-sm dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70">
                        Add Funds
                    </button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

        <Modal isOpen={isAddGoalModalOpen} onClose={() => setIsAddGoalModalOpen(false)} title="Create New Savings Goal">
            <form onSubmit={handleCreateGoal} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="goalName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Goal Name</label>
                    <input type="text" id="goalName" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Amount (Ksh)</label>
                        <input type="number" id="targetAmount" min="1" step="0.01" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                     <div>
                        <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
                        <input type="date" id="deadline" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddGoalModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">Create Goal</button>
                </div>
            </form>
        </Modal>

        <Modal isOpen={isAddFundsModalOpen} onClose={() => setIsAddFundsModalOpen(false)} title={`Add Funds to "${editingGoal?.name}"`}>
            <form onSubmit={handleAddFunds} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="fundsToAdd" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount to Add (Ksh)</label>
                    <input type="number" id="fundsToAdd" min="0.01" step="0.01" value={fundsToAdd} onChange={e => setFundsToAdd(parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setIsAddFundsModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">Add Funds</button>
                </div>
            </form>
        </Modal>

    </div>
  );
};

export default Savings;