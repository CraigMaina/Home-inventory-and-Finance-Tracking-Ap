
import React, { useState } from 'react';
import Card from './Card';
import Modal from './Modal';
import { mockSavingsGoals } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import type { SavingsGoal } from '../types';

type NewGoalState = Omit<SavingsGoal, 'goalId' | 'currentAmount' | 'targetAmount'> & { targetAmount: string };

const defaultNewGoal: NewGoalState = {
    name: '',
    targetAmount: '1000.00',
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
  const [fundsToAdd, setFundsToAdd] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmountInCents = Math.round(parseFloat(newGoal.targetAmount) * 100) || 0;
    if (!newGoal.name || targetAmountInCents <= 0) {
      alert('Please provide a valid name and target amount.');
      return;
    }
    const goalToAdd: SavingsGoal = {
      name: newGoal.name,
      deadline: newGoal.deadline,
      targetAmount: targetAmountInCents,
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
    setFundsToAdd('');
    setIsAddFundsModalOpen(true);
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const fundsValue = parseFloat(fundsToAdd) || 0;
    if (!editingGoal || fundsValue <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    const fundsInCents = Math.round(fundsValue * 100);
    setGoals(prevGoals =>
      prevGoals.map(g =>
        g.goalId === editingGoal.goalId
          ? { ...g, currentAmount: g.currentAmount + fundsInCents }
          : g
      )
    );
    setIsAddFundsModalOpen(false);
    setEditingGoal(null);
    showSuccess(`Ksh ${fundsValue.toLocaleString()} added to "${editingGoal.name}"!`);
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
                    <span>Ksh {(goal.currentAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>Ksh {(goal.targetAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                        <input type="text" id="targetAmount" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} inputMode="decimal" pattern="^\d*(\.\d{0,2})?$" placeholder="1000.00" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
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
                    <input type="text" id="fundsToAdd" value={fundsToAdd} onChange={e => setFundsToAdd(e.target.value)} inputMode="decimal" pattern="^\d*(\.\d{0,2})?$" placeholder="0.00" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
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
