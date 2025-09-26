import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema, verify2FASchema, verifyPhoneSchema, refreshTokenSchema } from '../schemas/authSchemas';

export const createAuthRoutes = (authController: AuthController) => {
  const router = Router();

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - email
   *               - password
   *             properties:
   *               phone:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: User already exists
   */
  router.post(
    '/register',
    validateRequest(registerSchema),
    (req, res) => authController.register(req, res)
  );

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: Login user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - password
   *             properties:
   *               phone:
   *                 type: string
   *               password:
   *                 type: string
   *               deviceInfo:
   *                 type: object
   *     responses:
   *       200:
   *         description: Login successful or 2FA required
   *       401:
   *         description: Invalid credentials
   *       429:
   *         description: Too many attempts
   */
  router.post(
    '/login',
    validateRequest(loginSchema),
    (req, res) => authController.login(req, res)
  );

  /**
   * @swagger
   * /auth/verify-2fa:
   *   post:
   *     tags: [Auth]
   *     summary: Verify 2FA code
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tempSessionId
   *               - code
   *             properties:
   *               tempSessionId:
   *                 type: string
   *               code:
   *                 type: string
   *     responses:
   *       200:
   *         description: 2FA verification successful
   *       401:
   *         description: Invalid session or code
   */
  router.post(
    '/verify-2fa',
    validateRequest(verify2FASchema),
    (req, res) => authController.verify2FA(req, res)
  );

  /**
   * @swagger
   * /auth/verify-phone:
   *   post:
   *     tags: [Auth]
   *     summary: Verify phone number
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - code
   *             properties:
   *               userId:
   *                 type: string
   *               code:
   *                 type: string
   *     responses:
   *       200:
   *         description: Phone verified successfully
   *       400:
   *         description: Invalid verification code
   */
  router.post(
    '/verify-phone',
    validateRequest(verifyPhoneSchema),
    (req, res) => authController.verifyPhone(req, res)
  );

  /**
   * @swagger
   * /auth/refresh-token:
   *   post:
   *     tags: [Auth]
   *     summary: Refresh access token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  router.post(
    '/refresh-token',
    validateRequest(refreshTokenSchema),
    (req, res) => authController.refreshToken(req, res)
  );

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     tags: [Auth]
   *     summary: Logout user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
   *       401:
   *         description: Unauthorized
   */
  router.post(
    '/logout',
    authMiddleware,
    (req, res) => {
      // Implementar logout (invalidar refresh token, etc)
      res.json({ message: 'Logout successful' });
    }
  );

  return router;
};
