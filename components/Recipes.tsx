
import React from 'react';
import Card from './Card';
import { mockRecipes } from '../constants';

const Recipes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Recipe Book</h1>
        <button className="bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
          Add New Recipe
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockRecipes.map((recipe) => (
          <Card key={recipe.recipeId} className="p-0 overflow-hidden">
            <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h4 className="text-lg font-bold text-slate-800">{recipe.name}</h4>
              <p className="text-sm text-slate-500">Estimated Cost: ${recipe.estimatedCost.toFixed(2)}</p>
              <div className="mt-4">
                 <h5 className="text-xs font-semibold text-slate-600 mb-1">Ingredients</h5>
                 <div className="flex flex-wrap gap-1">
                    {recipe.ingredients.map(ing => (
                        <span key={ing.name} className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded-full">{ing.name}</span>
                    ))}
                 </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
