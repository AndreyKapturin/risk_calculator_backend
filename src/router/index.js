import express from 'express';
import path from 'path';
import { getAllObjectsGroups } from '../controllers/objectsGroupsController.js';
import { getMetricsForObjectGroupById } from '../controllers/metricsController.js';
import { corsMiddleware } from '../middlewares/cors.js';
export const router = express.Router();

router.use(express.static(path.resolve('public')));
router.use(corsMiddleware);

router.get('/', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

// API router
const apiRouter = express.Router();
router.use('/apiV1', apiRouter);

apiRouter.get('/groups', getAllObjectsGroups);
apiRouter.get('/groups/:id/metrics', getMetricsForObjectGroupById);