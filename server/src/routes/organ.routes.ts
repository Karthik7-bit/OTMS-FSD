import { Router } from 'express';
import { getAllOrgans, createOrgan, updateOrganStatus, getHospitals } from '../controllers/organ.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllOrgans);
router.get('/hospitals', authenticate, getHospitals);
router.post('/', authenticate, createOrgan);
router.patch('/:id/status', authenticate, updateOrganStatus);

export default router;
