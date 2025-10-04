import { Router } from 'express';
import { getUsers, getUserStats, getUserById, updateUser, blockUser, unblockUser } from '../controllers/user';

const router = Router();

router.get('/users', getUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

export default router;
