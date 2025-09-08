import { Router } from 'express';
import { 
    getTransactions, 
    addTransaction,
    getFinanceCategories,
    addFinanceCategory 
} from './finance.controller';

const router = Router();

router.get('/transactions', getTransactions);
router.post('/transactions', addTransaction);

router.get('/categories', getFinanceCategories);
router.post('/categories', addFinanceCategory);

export default router;
