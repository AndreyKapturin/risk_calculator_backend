import express from 'express';
import * as ObjectsGroupConroller from '../controllers/objectsGroupsController.js';
import * as MetricController from '../controllers/metricsController.js';
import * as MetricIndicatorController from '../controllers/indicatorsController.js';
import * as UserController from '../controllers/usersController.js';
import { corsMiddleware } from '../middlewares/cors.js';
import { checkToken } from '../middlewares/authMiddleware.js';
export const router = express.Router();

router.use(corsMiddleware);
router.use(express.json());

const apiRouter = express.Router();
router.use('/api-v1', apiRouter);

apiRouter.get('/objects-groups', ObjectsGroupConroller.getObjectsGroupsList);
apiRouter.get('/objects-groups/:id', ObjectsGroupConroller.getObjectsGroupById);
apiRouter.patch('/objects-groups/:id', checkToken, ObjectsGroupConroller.updateObjectsGroup);
apiRouter.post('/objects-groups/:id/metrics', checkToken, ObjectsGroupConroller.addMetricToObjectsGroup);
apiRouter.delete('/objects-groups/:objectsGroupId/metrics/:metricId', checkToken, ObjectsGroupConroller.removeMetricFromObjectsGroup);
apiRouter.patch('/objects-groups/:id/values', checkToken, ObjectsGroupConroller.updateIndicatorsValues);

apiRouter.get('/metrics', MetricController.getMetrics);
apiRouter.get('/metrics/:id', MetricController.getMetricById);
apiRouter.post('/metrics', checkToken, MetricController.createMetric);
apiRouter.patch('/metrics/:id', checkToken, MetricController.updateMetric);
apiRouter.delete('/metrics/:id', checkToken, MetricController.deleteMetric);
apiRouter.post('/metrics/:id/indicators', checkToken, MetricController.addIndicatorToMetric);

apiRouter.delete('/indicators/:id', checkToken, MetricIndicatorController.deleteIndicator);
apiRouter.patch('/indicators/:id', checkToken, MetricIndicatorController.updateIndicatorText);

apiRouter.post('/users/authenticate', UserController.authenticate);

router.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send({ message: error.message });
})