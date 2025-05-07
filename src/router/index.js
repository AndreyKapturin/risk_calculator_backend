import express from 'express';
import * as ObjectsGroupConroller from '../controllers/objectsGroupsController.js';
import * as MetricController from '../controllers/metricsController.js';
import * as MetricIndicatorController from '../controllers/indicatorsController.js';
import { corsMiddleware } from '../middlewares/cors.js';
export const router = express.Router();

router.use(corsMiddleware);
router.use(express.json());

const apiRouter = express.Router();
router.use('/api-v1', apiRouter);

apiRouter.get('/objects-groups', ObjectsGroupConroller.getObjectsGroupsList);
apiRouter.get('/objects-groups/:id', ObjectsGroupConroller.getObjectsGroupById);
apiRouter.patch('/objects-groups/:id', ObjectsGroupConroller.updateObjectsGroup);
apiRouter.post('/objects-groups/:id/metrics', ObjectsGroupConroller.addMetricToObjectsGroup);
apiRouter.delete('/objects-groups/:objectsGroupId/metrics/:metricId', ObjectsGroupConroller.removeMetricFromObjectsGroup);
apiRouter.patch('/objects-groups/:id/values', ObjectsGroupConroller.updateIndicatorsValues);

apiRouter.get('/metrics', MetricController.getMetrics);
apiRouter.get('/metrics/:id', MetricController.getMetricById);
apiRouter.post('/metrics', MetricController.createMetric);
apiRouter.patch('/metrics/:id', MetricController.updateMetric);
apiRouter.delete('/metrics/:id', MetricController.deleteMetric);
apiRouter.post('/metrics/:id/indicators', MetricController.addIndicatorToMetric);

apiRouter.delete('/indicators/:id', MetricIndicatorController.deleteIndicator);
apiRouter.patch('/indicators/:id', MetricIndicatorController.updateIndicatorText);

router.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send({ message: error.message });
})