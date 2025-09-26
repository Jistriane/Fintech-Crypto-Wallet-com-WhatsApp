import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  trackMetricSchema,
  getTimeSeriesSchema,
  getDimensionDistributionSchema,
  getCorrelationsSchema,
  getTrendsSchema,
  getTopDimensionsSchema,
  getAnomaliesSchema,
  getMetricSummarySchema,
  getStatsByTypeSchema,
  getPercentilesSchema
} from '../schemas/analyticsSchemas';

export const createAnalyticsRoutes = (analyticsController: AnalyticsController) => {
  const router = Router();

  /**
   * @swagger
   * /analytics/metrics:
   *   post:
   *     tags: [Analytics]
   *     summary: Track a new metric
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - type
   *               - name
   *               - value
   *               - metricType
   *             properties:
   *               type:
   *                 type: string
   *                 enum: [USER, WALLET, TRANSACTION, TOKEN, LIQUIDITY, NOTIFICATION, SYSTEM]
   *               name:
   *                 type: string
   *               value:
   *                 type: string
   *               metricType:
   *                 type: string
   *                 enum: [COUNT, SUM, AVERAGE, RATE, DURATION]
   *     responses:
   *       201:
   *         description: Metric tracked successfully
   *       400:
   *         description: Invalid request
   *       401:
   *         description: Unauthorized
   */
  router.post(
    '/metrics',
    authMiddleware,
    validateRequest(trackMetricSchema),
    (req, res) => analyticsController.trackMetric(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/summary:
   *   get:
   *     tags: [Analytics]
   *     summary: Get metric summary
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [USER, WALLET, TRANSACTION, TOKEN, LIQUIDITY, NOTIFICATION, SYSTEM]
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Metric summary
   */
  router.get(
    '/metrics/:type/:name/summary',
    authMiddleware,
    validateRequest(getMetricSummarySchema),
    (req, res) => analyticsController.getMetricSummary(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/timeseries:
   *   get:
   *     tags: [Analytics]
   *     summary: Get metric time series
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startTime
   *         required: true
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: endTime
   *         required: true
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: granularity
   *         required: true
   *         schema:
   *           type: string
   *           enum: [MINUTE, HOUR, DAY, WEEK, MONTH]
   *     responses:
   *       200:
   *         description: Time series data
   */
  router.get(
    '/metrics/:type/:name/timeseries',
    authMiddleware,
    validateRequest(getTimeSeriesSchema),
    (req, res) => analyticsController.getTimeSeries(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/distribution:
   *   get:
   *     tags: [Analytics]
   *     summary: Get dimension distribution
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: dimension
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Dimension distribution
   */
  router.get(
    '/metrics/:type/:name/distribution',
    authMiddleware,
    validateRequest(getDimensionDistributionSchema),
    (req, res) => analyticsController.getDimensionDistribution(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/correlations:
   *   get:
   *     tags: [Analytics]
   *     summary: Get metric correlations
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: otherMetrics
   *         required: true
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *     responses:
   *       200:
   *         description: Metric correlations
   */
  router.get(
    '/metrics/:type/:name/correlations',
    authMiddleware,
    validateRequest(getCorrelationsSchema),
    (req, res) => analyticsController.getCorrelations(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/anomalies:
   *   get:
   *     tags: [Analytics]
   *     summary: Get metric anomalies
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startTime
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: endTime
   *         schema:
   *           type: string
   *           format: date-time
   *     responses:
   *       200:
   *         description: Metric anomalies
   */
  router.get(
    '/metrics/:type/:name/anomalies',
    authMiddleware,
    validateRequest(getAnomaliesSchema),
    (req, res) => analyticsController.getAnomalies(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/trends:
   *   get:
   *     tags: [Analytics]
   *     summary: Get metric trends
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: granularity
   *         required: true
   *         schema:
   *           type: string
   *           enum: [MINUTE, HOUR, DAY, WEEK, MONTH]
   *       - in: query
   *         name: periods
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         description: Metric trends
   */
  router.get(
    '/metrics/:type/:name/trends',
    authMiddleware,
    validateRequest(getTrendsSchema),
    (req, res) => analyticsController.getTrends(req, res)
  );

  /**
   * @swagger
   * /analytics/metrics/{type}/{name}/dimensions/top:
   *   get:
   *     tags: [Analytics]
   *     summary: Get top dimensions
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: dimension
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *     responses:
   *       200:
   *         description: Top dimensions
   */
  router.get(
    '/metrics/:type/:name/dimensions/top',
    authMiddleware,
    validateRequest(getTopDimensionsSchema),
    (req, res) => analyticsController.getTopDimensions(req, res)
  );

  return router;
};
