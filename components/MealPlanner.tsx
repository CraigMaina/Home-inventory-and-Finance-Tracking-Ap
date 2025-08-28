
import React from 'react';
import Card from './Card';
import { mockMealPlan } from '../constants';
import { MealType } from '../types';
import type { Recipe } from '../types';

const MealCard: React.FC<{ meal: Recipe | null, type: MealType }> = ({ meal, type }) => {
    if (!meal) {
        return (
            <div className="bg-slate-50 rounded-lg p-3 flex-1 flex flex-col justify-center items-center">
                <p className="text-xs text-slate-400 capitalize">{type}</p>
                <p className="text-sm text-slate-400">+</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg p-3 flex-1 border border-slate-200">
            <p className="text-xs text-slate-500 capitalize">{type}</p>
            <p className="text-sm font-semibold text-slate-800 truncate">{meal.name}</p>
        </div>
    )
};

const MealPlanner: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Meal Planner</h1>
                <button className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                    New Plan
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMealPlan.map((dayPlan) => (
                    <Card key={dayPlan.date}>
                        <h4 className="font-bold text-lg text-slate-800 mb-4">
                            {new Date(dayPlan.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </h4>
                        <div className="space-y-3">
                           <div className="flex space-x-3">
                                <MealCard meal={dayPlan.meals.breakfast || null} type={MealType.Breakfast} />
                                <MealCard meal={dayPlan.meals.lunch || null} type={MealType.Lunch} />
                           </div>
                           <div className="flex space-x-3">
                                <MealCard meal={dayPlan.meals.dinner || null} type={MealType.Dinner} />
                                <MealCard meal={dayPlan.meals.snack || null} type={MealType.Snack} />
                           </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default MealPlanner;
