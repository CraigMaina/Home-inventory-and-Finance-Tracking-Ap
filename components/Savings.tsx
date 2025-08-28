
import React from 'react';
import Card from './Card';
import { mockSavingsGoals } from '../constants';

const Savings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Savings Goals</h1>
        <button className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
          Create New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockSavingsGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card key={goal.goalId}>
              <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{goal.name}</h4>
                    <p className="text-sm text-slate-500">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-indigo-600 text-lg">{progress.toFixed(0)}%</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                    <span>${goal.currentAmount.toLocaleString()}</span>
                    <span>${goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Savings;
