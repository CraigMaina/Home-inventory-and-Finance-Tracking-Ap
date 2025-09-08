import { Router } from 'express';
import { getAnnouncements, addAnnouncement } from './announcements.controller';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', addAnnouncement);

export default router;
