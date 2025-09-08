

import React, { useState } from 'react';
import Card from './Card';
import Modal from './Modal';
import { mockRecipes } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Role, MealType } from '../types';
import type { Recipe, Ingredient } from '../types';

type NewRecipeIngredient = Omit<Ingredient, 'quantity'> & { quantity: string };
type NewRecipeState = Omit<Recipe, 'recipeId' | 'estimatedCost' | 'ingredients'> & {
    estimatedCost: string;
    ingredients: NewRecipeIngredient[];
};

const initialRecipeState: NewRecipeState = {
    name: '',
    instructions: [''],
    imageUrl: '',
    estimatedCost: '',
    ingredients: [{ itemId: '', name: '', quantity: '1', unit: 'pcs' }],
    category: MealType.Lunch,
};

const Recipes: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user.role === Role.Admin || user.role === Role.Editor;
  const [recipes, setRecipes] = useState<Recipe[]>(mockRecipes);
  const [activeCategory, setActiveCategory] = useState<MealType | 'all'>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState<NewRecipeState>(initialRecipeState);

  const categories: (MealType | 'all')[] = ['all', MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack];

  const filteredRecipes = activeCategory === 'all'
    ? recipes
    : recipes.filter(recipe => recipe.category === activeCategory);
    
  const handleToggleDetails = (recipeId: string) => {
    setExpandedRecipeId(prevId => (prevId === recipeId ? null : recipeId));
  };

  const handleInputChange = (field: keyof NewRecipeState, value: any) => {
    setNewRecipe(prev => ({...prev, [field]: value}));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if(newRecipe.imageUrl) {
            URL.revokeObjectURL(newRecipe.imageUrl);
        }
        handleInputChange('imageUrl', URL.createObjectURL(file));
    }
  };
  
  const handleIngredientChange = (index: number, field: keyof NewRecipeIngredient, value: string) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index] = {...updatedIngredients[index], [field]: value};
    setNewRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredient = () => {
    setNewRecipe(prev => ({...prev, ingredients: [...prev.ingredients, { itemId: '', name: '', quantity: '1', unit: 'pcs'}]}));
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = newRecipe.ingredients.filter((_, i) => i !== index);
    setNewRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updatedInstructions = [...newRecipe.instructions];
    updatedInstructions[index] = value;
    setNewRecipe(prev => ({...prev, instructions: updatedInstructions}));
  };
  
  const addInstruction = () => {
    setNewRecipe(prev => ({ ...prev, instructions: [...prev.instructions, '']}));
  };
  
  const removeInstruction = (index: number) => {
    const updatedInstructions = newRecipe.instructions.filter((_, i) => i !== index);
    setNewRecipe(prev => ({...prev, instructions: updatedInstructions}));
  };

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipe.name) {
        alert('Please enter a recipe name.');
        return;
    }

    const finalIngredients = newRecipe.ingredients.map(ing => ({
        ...ing,
        quantity: parseFloat(ing.quantity) || 0,
        itemId: ing.name.toLowerCase().replace(/\s+/g, '-') || `ing-${Date.now()}`
    }));

    const { estimatedCost, ...rest } = newRecipe;
    const costInCents = Math.round(parseFloat(estimatedCost) * 100) || 0;

    const recipeToAdd: Recipe = {
        ...rest,
        estimatedCost: costInCents,
        recipeId: `r${Date.now()}`,
        ingredients: finalIngredients
    };
    
    setRecipes(prev => [recipeToAdd, ...prev]);
    setNewRecipe(initialRecipeState);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Recipe Book</h1>
        {canEdit && (
            <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">
            Add New Recipe
            </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categories.map(category => (
            <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    activeCategory === category 
                    ? 'bg-slate-800 text-white dark:bg-indigo-600' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                }`}
            >
                {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.length > 0 ? filteredRecipes.map((recipe) => {
            const isExpanded = expandedRecipeId === recipe.recipeId;
            return (
              <Card key={recipe.recipeId} className="p-0 overflow-hidden flex flex-col">
                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-40 object-cover flex-shrink-0" />
                <div className="p-4 flex flex-col flex-grow">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full self-start mb-2 capitalize dark:bg-indigo-900/50 dark:text-indigo-300">{recipe.category}</span>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{recipe.name}</h4>
                  <p className="text-sm text-slate-500 mb-4 dark:text-slate-400">Estimated Cost: Ksh {(recipe.estimatedCost / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  
                  <div className="flex-grow">
                    {isExpanded && (
                       <div className="text-sm space-y-4">
                            <div>
                                <h5 className="font-semibold text-slate-700 mb-1 dark:text-slate-300">Ingredients</h5>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                    {recipe.ingredients.map(ing => (
                                        <li key={ing.itemId}>{`${ing.quantity} ${ing.unit} of ${ing.name}`}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-slate-700 mb-1 dark:text-slate-300">Instructions</h5>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                    {recipe.instructions.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    )}
                  </div>
                  
                  <div className="mt-auto pt-4"> 
                    {!isExpanded && (
                        <div className="mb-4">
                            <h5 className="text-xs font-semibold text-slate-600 mb-1 dark:text-slate-400">Key Ingredients</h5>
                            <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.slice(0, 3).map(ing => (
                                    <span key={ing.itemId} className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">{ing.name}</span>
                                ))}
                                {recipe.ingredients.length > 3 && (
                                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">+{recipe.ingredients.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="border-t border-slate-200 text-center pt-3 dark:border-slate-700">
                        <button
                            onClick={() => handleToggleDetails(recipe.recipeId)}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 w-full dark:text-indigo-400 dark:hover:text-indigo-300"
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? 'Show Less' : 'View Recipe'}
                        </button>
                    </div>
                </div>

                </div>
              </Card>
            )
        }) : (
            <div className="col-span-full text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No recipes found in this category.</p>
            </div>
        )}
      </div>

       <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Recipe" size="2xl">
            <form onSubmit={handleAddRecipe} className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label htmlFor="recipeName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Recipe Name</label>
                    <input type="text" id="recipeName" value={newRecipe.name} onChange={e => handleInputChange('name', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required/>
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Recipe Image</label>
                     {newRecipe.imageUrl && <img src={newRecipe.imageUrl} alt="Recipe preview" className="mt-2 rounded-lg max-h-40 w-auto" />}
                    <input type="file" id="imageUrl" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-400 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900/70"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                        <select id="category" value={newRecipe.category} onChange={e => handleInputChange('category', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" required>
                            {Object.values(MealType).map(type => <option key={type} value={type} className="capitalize">{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="cost" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estimated Cost (Ksh)</label>
                        <input type="text" id="cost" value={newRecipe.estimatedCost} onChange={e => handleInputChange('estimatedCost', e.target.value)} inputMode="decimal" pattern="^\d*(\.\d{0,2})?$" placeholder="0.00" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                    </div>
                </div>

                <fieldset>
                    <legend className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Ingredients</legend>
                    <div className="space-y-2">
                        {newRecipe.ingredients.map((ing, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" placeholder="Name" value={ing.name} onChange={e => handleIngredientChange(index, 'name', e.target.value)} className="flex-grow w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                                <input type="text" placeholder="Qty" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', e.target.value)} inputMode="decimal" pattern="^\d*(\.\d*)?$" className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                                <input type="text" placeholder="Unit" value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"/>
                                <button type="button" onClick={() => removeIngredient(index)} className="text-red-500 hover:text-red-700 font-bold text-xl dark:text-red-400 dark:hover:text-red-300">&times;</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addIngredient} className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">+ Add Ingredient</button>
                </fieldset>

                <fieldset>
                    <legend className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Instructions</legend>
                     <div className="space-y-2">
                        {newRecipe.instructions.map((step, index) => (
                             <div key={index} className="flex items-start gap-2">
                                 <span className="text-slate-500 font-semibold pt-2 dark:text-slate-400">{index + 1}.</span>
                                 <textarea
                                    placeholder={`Step ${index + 1}`}
                                    value={step}
                                    onChange={e => handleInstructionChange(index, e.target.value)}
                                    onInput={e => {
                                        const target = e.currentTarget;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    rows={1}
                                    className="flex-grow w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 resize-none overflow-hidden"
                                 />
                                 <button type="button" onClick={() => removeInstruction(index)} className="text-red-500 hover:text-red-700 font-bold text-xl pt-1 dark:text-red-400 dark:hover:text-red-300">&times;</button>
                             </div>
                        ))}
                     </div>
                     <button type="button" onClick={addInstruction} className="mt-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">+ Add Step</button>
                </fieldset>
                
                <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button type="submit" className="bg-slate-800 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors dark:bg-indigo-600 dark:hover:bg-indigo-500">Add Recipe</button>
                </div>
            </form>
       </Modal>
    </div>
  );
};

export default Recipes;