import { Router } from 'express';
import {
    getInventoryItems,
    addInventoryItem,
    getInventoryCategories,
    addInventoryCategory
} from './inventory.controller';

const router = Router();

router.get('/items', getInventoryItems);
router.post('/items', addInventoryItem);

router.get('/categories', getInventoryCategories);
router.post('/categories', addInventoryCategory);

export default router;
