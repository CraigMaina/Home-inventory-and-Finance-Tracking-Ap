

import React, { useState } from 'react';
import Card from './Card';
import Modal from './Modal';
import { MealType, Role } from '../types';
import type { MealPlan, Meal, InventoryItem, Recipe } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { mockRecipes } from '../constants';

const CheckCircleIcon: React.FC<{className?: string}> = ({className="w-5 h-5"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

interface MealCardProps {
    meal: Meal | null;
    type: MealType;
    onPrepare: () => void;
    onAdd: () => void;
    canEdit: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ meal, type, onPrepare, onAdd, canEdit }) => {
    if (!meal) {
        return (
            <button
                onClick={onAdd}
                disabled={!canEdit}
                className="bg-slate-50 rounded-lg p-3 flex-1 flex flex-col justify-center items-center text-center hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:hover:bg-slate-50 dark:bg-slate-700 dark:disabled:hover:bg-slate-700 dark:hover:bg-slate-600"
                aria-label={`Add ${type}`}
            >
                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{type}</p>
                <p className="text-sm text-slate-500 font-semibold dark:text-slate-300">+</p>
            </button>
        );
    }

    const { recipe, prepared } = meal;

    return (
        <div className={`rounded-lg p-3 flex-1 border ${prepared ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}>
            <div className="flex justify-between items-start">
                 <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{type}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate dark:text-slate-200">{recipe.name}</p>
                 </div>
                 {prepared && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
            </div>
            {canEdit && !prepared && (
                <button 
                    onClick={onPrepare} 
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    Mark as Prepared
                </button>
            )}
        </div>
    )
};

interface MealPlannerProps {
    mealPlan: MealPlan[];
    setMealPlan: React.Dispatch<React.SetStateAction<MealPlan[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ mealPlan, setMealPlan, inventory, setInventory }) => {
    const { user } = useAuth();
    const canEdit = user.role === Role.Admin || user.role === Role.Editor;

    const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
    const [mealContext, setMealContext] = useState<{ date: string; type: MealType } | null>(null);

    const openAddMealModal = (date: string, type: MealType) => {
        if (!canEdit) return;
        setMealContext({ date, type });
        setIsAddMealModalOpen(true);
    };

    const handleSelectRecipe = (recipe: Recipe) => {
        if (!mealContext) return;

        const { date, type } = mealContext;
        const newMeal: Meal = { recipe, prepared: false };

        const updatedMealPlan = mealPlan.map(plan => {
            if (plan.date === date) {
                return {
                    ...plan,
                    meals: { ...plan.meals, [type]: newMeal }
                };
            }
            return plan;
        });

        setMealPlan(updatedMealPlan);
        setIsAddMealModalOpen(false);
        setMealContext(null);
    };

    const handleAddNewPlan = () => {
        const lastDateStr = mealPlan.length > 0 ? mealPlan[mealPlan.length - 1].date : new Date().toISOString().split('T')[0];
        
        // Use UTC methods to avoid timezone issues
        const parts = lastDateStr.split('-').map(part => parseInt(part, 10));
        // Note: month is 0-indexed in JS Date (parts[1] - 1)
        const lastDateUTC = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        lastDateUTC.setUTCDate(lastDateUTC.getUTCDate() + 1);
        const nextDateStr = lastDateUTC.toISOString().split('T')[0];

        const newDayPlan: MealPlan = {
            date: nextDateStr,
            meals: {
                [MealType.Breakfast]: null,
                [MealType.Lunch]: null,
                [MealType.Dinner]: null,
                [MealType.Snack]: null,
            }
        };
        setMealPlan(prev => [...prev, newDayPlan]);
    };

    const handleMarkAsPrepared = (date: string, mealType: MealType) => {
        const planForDay = mealPlan.find(p => p.date === date);
        const mealToPrepare = planForDay?.meals[mealType];

        if (!mealToPrepare) return;
        
        const { recipe } = mealToPrepare;
        
        const missingIngredients: string[] = [];
        const inventoryUpdates: {itemId: string, newQuantity: number}[] = [];

        for (const ingredient of recipe.ingredients) {
            const inventoryItem = inventory.find(i => i.itemId === ingredient.itemId);
            
            if (!inventoryItem) {
                missingIngredients.push(`${ingredient.name} (not in inventory)`);
                continue;
            }

            let requiredQuantity = ingredient.quantity;
            let inventoryQuantity = inventoryItem.quantity;
            let inventoryUnit = inventoryItem.unit;

            if (ingredient.unit === 'g' && inventoryUnit === 'kg') {
                inventoryQuantity *= 1000;
            } else if (ingredient.unit === 'kg' && inventoryUnit === 'g') {
                requiredQuantity *= 1000;
            } else if (ingredient.unit === 'ml' && inventoryUnit === 'L') {
                inventoryQuantity *= 1000;
            } else if (ingredient.unit === 'L' && inventoryUnit === 'ml') {
                requiredQuantity *= 1000;
            } else if (ingredient.unit !== inventoryUnit) {
                 missingIngredients.push(`${ingredient.name} (unit mismatch: need ${ingredient.unit}, have ${inventoryUnit})`);
                 continue;
            }

            if (inventoryQuantity < requiredQuantity) {
                missingIngredients.push(`${ingredient.name} (need ${requiredQuantity} ${ingredient.unit}, have ${inventoryQuantity} ${ingredient.unit})`);
            } else {
                 let finalInventoryQuantity = (inventoryQuantity - requiredQuantity);
                 if ((ingredient.unit === 'g' && inventoryUnit === 'kg') || (ingredient.unit === 'ml' && inventoryUnit === 'L')) {
                    finalInventoryQuantity /= 1000;
                 }
                inventoryUpdates.push({ itemId: ingredient.itemId, newQuantity: finalInventoryQuantity });
            }
        }

        if (missingIngredients.length > 0) {
            alert(`Cannot prepare meal. Missing ingredients:\n- ${missingIngredients.join('\n- ')}`);
            return;
        }

        const updatedInventory = inventory.map(item => {
            const update = inventoryUpdates.find(u => u.itemId === item.itemId);
            return update ? { ...item, quantity: update.newQuantity } : item;
        });
        setInventory(updatedInventory);

        const updatedMealPlan = mealPlan.map(plan => {
            if (plan.date === date) {
                const updatedMeals = { ...plan.meals };
                const meal = updatedMeals[mealType];
                if(meal){
                    updatedMeals[mealType] = { ...meal, prepared: true };
                }
                return { ...plan, meals: updatedMeals };
            }
            return plan;
        });
        setMealPlan(updatedMealPlan);

        alert(`"${recipe.name}" marked as prepared. Inventory has been updated.`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Meal Planner</h1>
                {canEdit && (
                    <button onClick={handleAddNewPlan} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
                        New Plan
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mealPlan.map((dayPlan) => (
                    <Card key={dayPlan.date}>
                        <h4 className="font-bold text-lg text-slate-800 mb-4 dark:text-slate-200">
                            {new Date(dayPlan.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </h4>
                        <div className="space-y-3">
                           <div className="flex space-x-3">
                                <MealCard meal={dayPlan.meals.breakfast || null} type={MealType.Breakfast} onPrepare={() => handleMarkAsPrepared(dayPlan.date, MealType.Breakfast)} onAdd={() => openAddMealModal(dayPlan.date, MealType.Breakfast)} canEdit={canEdit} />
                                <MealCard meal={dayPlan.meals.lunch || null} type={MealType.Lunch} onPrepare={() => handleMarkAsPrepared(dayPlan.date, MealType.Lunch)} onAdd={() => openAddMealModal(dayPlan.date, MealType.Lunch)} canEdit={canEdit} />
                           </div>
                           <div className="flex space-x-3">
                                <MealCard meal={dayPlan.meals.dinner || null} type={MealType.Dinner} onPrepare={() => handleMarkAsPrepared(dayPlan.date, MealType.Dinner)} onAdd={() => openAddMealModal(dayPlan.date, MealType.Dinner)} canEdit={canEdit} />
                                <MealCard meal={dayPlan.meals.snack || null} type={MealType.Snack} onPrepare={() => handleMarkAsPrepared(dayPlan.date, MealType.Snack)} onAdd={() => openAddMealModal(dayPlan.date, MealType.Snack)} canEdit={canEdit} />
                           </div>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="print:hidden">
            <Modal 
                isOpen={isAddMealModalOpen} 
                onClose={() => setIsAddMealModalOpen(false)} 
                title={`Add ${mealContext?.type || 'Meal'} for ${mealContext?.date ? new Date(mealContext.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}`}
                size="lg"
            >
                <div className="mt-4 max-h-[60vh] overflow-y-auto p-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mockRecipes.map(recipe => (
                            <button 
                                key={recipe.recipeId} 
                                onClick={() => handleSelectRecipe(recipe)}
                                className="block text-left p-2 border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:hover:bg-slate-700"
                            >
                                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-24 object-cover rounded mb-2"/>
                                <h5 className="font-semibold text-slate-800 text-sm dark:text-slate-200">{recipe.name}</h5>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
            </div>
        </div>
    );
};

export default MealPlanner;