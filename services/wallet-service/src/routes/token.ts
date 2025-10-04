import { Router } from 'express';
import { getTokens, getTokenStats, getTokenById, updateToken } from '../controllers/token';

const router = Router();

router.get('/tokens', getTokens);
router.get('/tokens/stats', getTokenStats);
router.get('/tokens/:id', getTokenById);
router.put('/tokens/:id', updateToken);

export default router;
