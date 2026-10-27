import { Router } from 'express';
import { getAllUsers, getDonors, getRecipients } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.get('/donors', authenticate, getDonors);
router.get('/recipients', authenticate, getRecipients);

export default router;
