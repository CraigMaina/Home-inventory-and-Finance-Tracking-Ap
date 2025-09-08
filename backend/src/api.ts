import { Router } from 'express';
import financeRoutes from './features/finance/finance.routes';
import inventoryRoutes from './features/inventory/inventory.routes';
import recipeRoutes from './features/recipes/recipes.routes';
import savingsRoutes from './features/savings/savings.routes';
import announcementRoutes from './features/announcements/announcements.routes';
import userRoutes from './features/users/users.routes';
import mealPlanRoutes from './features/mealPlans/mealPlans.routes';

const router = Router();

router.use('/finance', financeRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/recipes', recipeRoutes);
router.use('/savings', savingsRoutes);
router.use('/announcements', announcementRoutes);
router.use('/users', userRoutes);
router.use('/meal-plans', mealPlanRoutes);


export default router;
