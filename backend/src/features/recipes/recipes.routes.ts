import { Router } from 'express';
import { getRecipes, addRecipe } from './recipes.controller';

const router = Router();

router.get('/', getRecipes);
router.post('/', addRecipe);

export default router;
