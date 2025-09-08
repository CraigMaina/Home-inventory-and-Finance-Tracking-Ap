import { Router } from 'express';
import { getCurrentUser } from './users.controller';

const router = Router();

router.get('/current', getCurrentUser);

export default router;
