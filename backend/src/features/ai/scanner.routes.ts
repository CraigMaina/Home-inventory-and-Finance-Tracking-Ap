import { Router } from 'express';
import { parseReceipt } from './scanner.controller';

const router = Router();

router.post('/scan', parseReceipt);

export default router;