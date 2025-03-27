import express from 'express';
import path from 'path';
import { addMetricToObjectsGroup, deleteMetricFromObjectsGroup, getObjectsGroupById, getObjectsGroupsList, updateIndicatorsValuesForObjectsGroup, updateObjectsGroup } from '../controllers/objectsGroupsController.js';
import { addIndicatorToMetric, createMetric, deleteIndicatorFromMetric, getAllMetrics, updateMetric } from '../controllers/metricsController.js';
import { corsMiddleware } from '../middlewares/cors.js';
import { updateIndicatorText } from '../controllers/indicatorsController.js';
export const router = express.Router();

router.use(express.static(path.resolve('public')));
router.use(corsMiddleware);
router.use(express.json());

router.get('/', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

// API router
const apiRouter = express.Router();
router.use('/api-v1', apiRouter);

apiRouter.get('/objects-groups', getObjectsGroupsList);
apiRouter.get('/objects-groups/:id', getObjectsGroupById);
apiRouter.patch('/objects-groups/:id', updateObjectsGroup);
apiRouter.post('/objects-groups/:id/metrics', addMetricToObjectsGroup);
apiRouter.delete('/objects-groups/:objectsGroupId/metrics/:metricId', deleteMetricFromObjectsGroup);
apiRouter.patch('/objects-groups/:id/values', updateIndicatorsValuesForObjectsGroup);
apiRouter.get('/metrics', getAllMetrics);
apiRouter.post('/metrics', createMetric);
apiRouter.put('/metrics/:id', updateMetric);
apiRouter.post('/metrics/:id/indicators', addIndicatorToMetric);
apiRouter.delete('/metrics/:metricId/indicators/:indicatorId', deleteIndicatorFromMetric);
apiRouter.patch('/indicators/:id', updateIndicatorText);