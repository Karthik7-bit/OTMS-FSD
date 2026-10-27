import { Router } from 'express';
import { getAllRequests, createRequest, updateRequestStatus } from '../controllers/request.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllRequests);
router.post('/', authenticate, createRequest);
router.patch('/:id/status', authenticate, updateRequestStatus);

export default router;
