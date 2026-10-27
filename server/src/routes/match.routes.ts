import { Router } from 'express';
import { runMatching, getMatches, allocateMatch } from '../controllers/match.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMatches);
router.post('/run', authenticate, runMatching);
router.post('/:id/allocate', authenticate, allocateMatch);

export default router;
