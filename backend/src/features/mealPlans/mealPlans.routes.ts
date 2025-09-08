import { Router } from 'express';
import { getMealPlan } from './mealPlans.controller';

const router = Router();

// Placeholder route
router.get('/', getMealPlan);

export default router;
