import { Router } from 'express';
import { WalletController } from '../controllers/WalletController';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createWalletSchema,
  sendTransactionSchema,
  addTokenSchema,
  addPriceAlertSchema,
  updateSettingsSchema,
  addTrustedAddressSchema,
  backupWalletSchema,
  blockWalletSchema,
  getTransactionHistorySchema,
  getTokenPerformanceSchema,
  getTopTokensSchema
} from '../schemas/walletSchemas';

export const createWalletRoutes = (walletController: WalletController) => {
  const router = Router();

  /**
   * @swagger
   * /wallets:
   *   post:
   *     tags: [Wallets]
   *     summary: Create a new wallet
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - network
   *             properties:
   *               userId:
   *                 type: string
   *                 format: uuid
   *               network:
   *                 type: string
   *                 enum: [ETHEREUM, POLYGON, BSC, ARBITRUM]
   *     responses:
   *       201:
   *         description: Wallet created successfully
   *       400:
   *         description: Invalid request
   *       401:
   *         description: Unauthorized
   */
  router.post(
    '/',
    authMiddleware,
    validateRequest(createWalletSchema),
    (req, res) => walletController.createWallet(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/balance:
   *   get:
   *     tags: [Wallets]
   *     summary: Get wallet balance
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Wallet balance
   *       404:
   *         description: Wallet not found
   */
  router.get(
    '/:walletId/balance',
    authMiddleware,
    (req, res) => walletController.getWalletBalance(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/transactions:
   *   post:
   *     tags: [Wallets]
   *     summary: Send a transaction
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - to
   *               - amount
   *             properties:
   *               to:
   *                 type: string
   *               amount:
   *                 type: string
   *               tokenAddress:
   *                 type: string
   *     responses:
   *       200:
   *         description: Transaction sent successfully
   *       400:
   *         description: Invalid request
   *       404:
   *         description: Wallet not found
   */
  router.post(
    '/:walletId/transactions',
    authMiddleware,
    validateRequest(sendTransactionSchema),
    (req, res) => walletController.sendTransaction(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/tokens:
   *   post:
   *     tags: [Wallets]
   *     summary: Add a token to the wallet
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tokenAddress
   *             properties:
   *               tokenAddress:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token added successfully
   *       400:
   *         description: Invalid token address
   *       404:
   *         description: Wallet not found
   *       409:
   *         description: Token already added
   */
  router.post(
    '/:walletId/tokens',
    authMiddleware,
    validateRequest(addTokenSchema),
    (req, res) => walletController.addToken(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/tokens/{tokenAddress}:
   *   delete:
   *     tags: [Wallets]
   *     summary: Remove a token from the wallet
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: tokenAddress
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Token removed successfully
   *       404:
   *         description: Token not found
   */
  router.delete(
    '/:walletId/tokens/:tokenAddress',
    authMiddleware,
    (req, res) => walletController.removeToken(req, res)
  );

  /**
   * @swagger
   * /wallets/tokens/{tokenId}/alerts:
   *   post:
   *     tags: [Wallets]
   *     summary: Add a price alert for a token
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tokenId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - condition
   *               - price
   *             properties:
   *               condition:
   *                 type: string
   *                 enum: [above, below]
   *               price:
   *                 type: string
   *     responses:
   *       200:
   *         description: Price alert added successfully
   */
  router.post(
    '/tokens/:tokenId/alerts',
    authMiddleware,
    validateRequest(addPriceAlertSchema),
    (req, res) => walletController.addPriceAlert(req, res)
  );

  /**
   * @swagger
   * /wallets/tokens/{tokenId}/alerts/{alertId}:
   *   delete:
   *     tags: [Wallets]
   *     summary: Remove a price alert
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tokenId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: alertId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Price alert removed successfully
   */
  router.delete(
    '/tokens/:tokenId/alerts/:alertId',
    authMiddleware,
    (req, res) => walletController.removePriceAlert(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/transactions:
   *   get:
   *     tags: [Wallets]
   *     summary: Get transaction history
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Transaction history
   */
  router.get(
    '/:walletId/transactions',
    authMiddleware,
    validateRequest(getTransactionHistorySchema),
    (req, res) => walletController.getTransactionHistory(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/settings:
   *   put:
   *     tags: [Wallets]
   *     summary: Update wallet settings
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               defaultGasPrice:
   *                 type: string
   *               autoConfirmThreshold:
   *                 type: string
   *               notificationPreferences:
   *                 type: object
   *     responses:
   *       200:
   *         description: Settings updated successfully
   */
  router.put(
    '/:walletId/settings',
    authMiddleware,
    validateRequest(updateSettingsSchema),
    (req, res) => walletController.updateSettings(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/trusted-addresses:
   *   post:
   *     tags: [Wallets]
   *     summary: Add a trusted address
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - address
   *             properties:
   *               address:
   *                 type: string
   *     responses:
   *       200:
   *         description: Trusted address added successfully
   */
  router.post(
    '/:walletId/trusted-addresses',
    authMiddleware,
    validateRequest(addTrustedAddressSchema),
    (req, res) => walletController.addTrustedAddress(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/trusted-addresses/{address}:
   *   delete:
   *     tags: [Wallets]
   *     summary: Remove a trusted address
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Trusted address removed successfully
   */
  router.delete(
    '/:walletId/trusted-addresses/:address',
    authMiddleware,
    (req, res) => walletController.removeTrustedAddress(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/backup:
   *   post:
   *     tags: [Wallets]
   *     summary: Backup wallet
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - backupMethod
   *             properties:
   *               backupMethod:
   *                 type: string
   *                 enum: [cloud, local]
   *     responses:
   *       200:
   *         description: Wallet backup successful
   */
  router.post(
    '/:walletId/backup',
    authMiddleware,
    validateRequest(backupWalletSchema),
    (req, res) => walletController.backupWallet(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/block:
   *   post:
   *     tags: [Wallets]
   *     summary: Block wallet
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - reason
   *             properties:
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Wallet blocked successfully
   */
  router.post(
    '/:walletId/block',
    authMiddleware,
    validateRequest(blockWalletSchema),
    (req, res) => walletController.blockWallet(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/unblock:
   *   post:
   *     tags: [Wallets]
   *     summary: Unblock wallet
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Wallet unblocked successfully
   */
  router.post(
    '/:walletId/unblock',
    authMiddleware,
    (req, res) => walletController.unblockWallet(req, res)
  );

  /**
   * @swagger
   * /wallets/tokens/{tokenId}/performance:
   *   get:
   *     tags: [Wallets]
   *     summary: Get token performance
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: tokenId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: days
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Token performance data
   */
  router.get(
    '/tokens/:tokenId/performance',
    authMiddleware,
    validateRequest(getTokenPerformanceSchema),
    (req, res) => walletController.getTokenPerformance(req, res)
  );

  /**
   * @swagger
   * /wallets/{walletId}/distribution:
   *   get:
   *     tags: [Wallets]
   *     summary: Get portfolio distribution
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: walletId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Portfolio distribution data
   */
  router.get(
    '/:walletId/distribution',
    authMiddleware,
    (req, res) => walletController.getPortfolioDistribution(req, res)
  );

  /**
   * @swagger
   * /wallets/tokens/top:
   *   get:
   *     tags: [Wallets]
   *     summary: Get top tokens by value
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Top tokens data
   */
  router.get(
    '/tokens/top',
    authMiddleware,
    validateRequest(getTopTokensSchema),
    (req, res) => walletController.getTopTokens(req, res)
  );

  return router;
};
