import { Router } from 'express';
import { getWallets, getWalletStats, getWalletById, updateWallet, blockWallet, unblockWallet } from '../controllers/wallet';

const router = Router();

router.get('/wallets', getWallets);
router.get('/wallets/stats', getWalletStats);
router.get('/wallets/:id', getWalletById);
router.put('/wallets/:id', updateWallet);
router.post('/wallets/:id/block', blockWallet);
router.post('/wallets/:id/unblock', unblockWallet);

export default router;
