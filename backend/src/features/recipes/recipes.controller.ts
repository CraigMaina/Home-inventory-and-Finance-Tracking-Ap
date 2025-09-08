import { Request, Response } from 'express';
import db from '../../config/db';
import { Recipe } from '../../types';

export const getRecipes = async (req: Request, res: Response) => {
    try {
        // This is a simplified query. A real implementation would involve a JOIN to get ingredients.
        const result = await db.query('SELECT * FROM recipes ORDER BY name');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes', error });
    }
};

export const addRecipe = async (req: Request, res: Response) => {
    try {
        const { name, instructions, imageUrl, estimatedCost, ingredients, category }: Omit<Recipe, 'recipeId'> = req.body;
        
        // In a real app, this should be a transaction
        const newRecipe = await db.query(
            'INSERT INTO recipes (name, instructions, image_url, estimated_cost, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, instructions, imageUrl, estimatedCost, category]
        );

        // Here you would also loop through ingredients and insert them into the `recipe_ingredients` table.
        // This is simplified for brevity.
        
        res.status(201).json(newRecipe.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error adding recipe', error });
    }
};
