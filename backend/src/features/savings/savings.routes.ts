import { Router } from 'express';
import { getSavingsGoals, addSavingsGoal, addFundsToGoal } from './savings.controller';

const router = Router();

router.get('/', getSavingsGoals);
router.post('/', addSavingsGoal);
router.put('/:goalId/add-funds', addFundsToGoal);


export default router;
