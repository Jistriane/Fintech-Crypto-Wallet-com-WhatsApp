import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createNotificationSchema,
  markAsReadSchema,
  cancelNotificationSchema,
  getNotificationVolumeSchema,
  getTopFailureReasonsSchema,
  validateTemplateSchema,
  validatePhoneNumberSchema,
  webhookSchema
} from '../schemas/notificationSchemas';

export const createNotificationRoutes = (notificationController: NotificationController) => {
  const router = Router();

  /**
   * @swagger
   * /notifications:
   *   post:
   *     tags: [Notifications]
   *     summary: Create a new notification
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
   *               - type
   *               - priority
   *               - category
   *               - template
   *               - parameters
   *             properties:
   *               userId:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [WHATSAPP, EMAIL, PUSH, SMS]
   *               priority:
   *                 type: string
   *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
   *               category:
   *                 type: string
   *                 enum: [SECURITY, TRANSACTION, KYC, PRICE_ALERT, SYSTEM, MARKETING]
   *               template:
   *                 type: string
   *               parameters:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Notification created successfully
   *       400:
   *         description: Invalid request
   *       401:
   *         description: Unauthorized
   */
  router.post(
    '/',
    authMiddleware,
    validateRequest(createNotificationSchema),
    (req, res) => notificationController.createNotification(req, res)
  );

  /**
   * @swagger
   * /notifications/{id}:
   *   get:
   *     tags: [Notifications]
   *     summary: Get notification status
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Notification status
   *       404:
   *         description: Notification not found
   */
  router.get(
    '/:id',
    authMiddleware,
    (req, res) => notificationController.getNotificationStatus(req, res)
  );

  /**
   * @swagger
   * /notifications/{id}/read:
   *   post:
   *     tags: [Notifications]
   *     summary: Mark notification as read
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
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
   *               - channel
   *             properties:
   *               channel:
   *                 type: string
   *               deviceInfo:
   *                 type: object
   *     responses:
   *       200:
   *         description: Notification marked as read
   */
  router.post(
    '/:id/read',
    authMiddleware,
    validateRequest(markAsReadSchema),
    (req, res) => notificationController.markAsRead(req, res)
  );

  /**
   * @swagger
   * /notifications/{id}/cancel:
   *   post:
   *     tags: [Notifications]
   *     summary: Cancel notification
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
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
   *         description: Notification cancelled successfully
   */
  router.post(
    '/:id/cancel',
    authMiddleware,
    validateRequest(cancelNotificationSchema),
    (req, res) => notificationController.cancelNotification(req, res)
  );

  /**
   * @swagger
   * /notifications/users/{userId}/stats:
   *   get:
   *     tags: [Notifications]
   *     summary: Get notification stats for user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Notification stats
   */
  router.get(
    '/users/:userId/stats',
    authMiddleware,
    (req, res) => notificationController.getNotificationStats(req, res)
  );

  /**
   * @swagger
   * /notifications/metrics/delivery-rate/{type}:
   *   get:
   *     tags: [Notifications]
   *     summary: Get delivery rate by type
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [WHATSAPP, EMAIL, PUSH, SMS]
   *     responses:
   *       200:
   *         description: Delivery rate
   */
  router.get(
    '/metrics/delivery-rate/:type',
    authMiddleware,
    (req, res) => notificationController.getDeliveryRate(req, res)
  );

  /**
   * @swagger
   * /notifications/metrics/failure-rate/{type}:
   *   get:
   *     tags: [Notifications]
   *     summary: Get failure rate by type
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [WHATSAPP, EMAIL, PUSH, SMS]
   *     responses:
   *       200:
   *         description: Failure rate
   */
  router.get(
    '/metrics/failure-rate/:type',
    authMiddleware,
    (req, res) => notificationController.getFailureRate(req, res)
  );

  /**
   * @swagger
   * /notifications/metrics/delivery-time/{type}:
   *   get:
   *     tags: [Notifications]
   *     summary: Get average delivery time by type
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [WHATSAPP, EMAIL, PUSH, SMS]
   *     responses:
   *       200:
   *         description: Average delivery time
   */
  router.get(
    '/metrics/delivery-time/:type',
    authMiddleware,
    (req, res) => notificationController.getAverageDeliveryTime(req, res)
  );

  /**
   * @swagger
   * /notifications/metrics/volume:
   *   get:
   *     tags: [Notifications]
   *     summary: Get notification volume
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: days
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         description: Notification volume
   */
  router.get(
    '/metrics/volume',
    authMiddleware,
    validateRequest(getNotificationVolumeSchema),
    (req, res) => notificationController.getNotificationVolume(req, res)
  );

  /**
   * @swagger
   * /notifications/metrics/failure-reasons:
   *   get:
   *     tags: [Notifications]
   *     summary: Get top failure reasons
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *     responses:
   *       200:
   *         description: Top failure reasons
   */
  router.get(
    '/metrics/failure-reasons',
    authMiddleware,
    validateRequest(getTopFailureReasonsSchema),
    (req, res) => notificationController.getTopFailureReasons(req, res)
  );

  /**
   * @swagger
   * /notifications/whatsapp/validate-template:
   *   post:
   *     tags: [Notifications]
   *     summary: Validate WhatsApp template
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - template
   *             properties:
   *               template:
   *                 type: string
   *     responses:
   *       200:
   *         description: Template validation result
   */
  router.post(
    '/whatsapp/validate-template',
    authMiddleware,
    validateRequest(validateTemplateSchema),
    (req, res) => notificationController.validateTemplate(req, res)
  );

  /**
   * @swagger
   * /notifications/whatsapp/validate-phone:
   *   post:
   *     tags: [Notifications]
   *     summary: Validate phone number for WhatsApp
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *             properties:
   *               phone:
   *                 type: string
   *     responses:
   *       200:
   *         description: Phone number validation result
   */
  router.post(
    '/whatsapp/validate-phone',
    authMiddleware,
    validateRequest(validatePhoneNumberSchema),
    (req, res) => notificationController.validatePhoneNumber(req, res)
  );

  /**
   * @swagger
   * /notifications/whatsapp/templates:
   *   get:
   *     tags: [Notifications]
   *     summary: Get available WhatsApp templates
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of available templates
   */
  router.get(
    '/whatsapp/templates',
    authMiddleware,
    (req, res) => notificationController.getTemplates(req, res)
  );

  /**
   * @swagger
   * /notifications/whatsapp/webhook:
   *   post:
   *     tags: [Notifications]
   *     summary: WhatsApp webhook endpoint
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook processed successfully
   */
  router.post(
    '/whatsapp/webhook',
    validateRequest(webhookSchema),
    (req, res) => notificationController.handleWebhook(req, res)
  );

  return router;
};
