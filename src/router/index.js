import express from 'express';
import path from 'path';
import * as ObjectsGroupConroller from '../controllers/objectsGroupsController.js';
import * as MetricController from '../controllers/metricsController.js';
import * as MetricIndicatorController from '../controllers/indicatorsController.js';
import * as Validator from '../utils/validator.js';
import { corsMiddleware } from '../middlewares/cors.js';
import { ErrorWithStatusCode } from '../utils/ErrorWithStatusCode.js';
export const router = express.Router();

router.use(express.static(path.resolve('public')));
router.use(corsMiddleware);
router.use(express.json());

router.get('/', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

const apiRouter = express.Router();
router.use('/api-v1', apiRouter);

apiRouter.get('/objects-groups', ObjectsGroupConroller.getObjectsGroupsList);
apiRouter.get('/objects-groups/:id',
  Validator.getObjectsGroupWithMetricsByIdSchema,
  ObjectsGroupConroller.getObjectsGroupById
);
apiRouter.patch('/objects-groups/:id',
  Validator.updateObjectsGroupSchema ,
  ObjectsGroupConroller.updateObjectsGroup
);
apiRouter.post('/objects-groups/:id/metrics',
  Validator.addMetricToObjectsGroupSchema,
  ObjectsGroupConroller.addMetricToObjectsGroup
);
apiRouter.delete('/objects-groups/:objectsGroupId/metrics/:metricId',
  Validator.deleteMetricFromObjectsGroupSchema,
  ObjectsGroupConroller.removeMetricFromObjectsGroup
);
apiRouter.patch('/objects-groups/:id/values',
  Validator.updateIndicatorsValuesForObjectsGroupSchema,
  ObjectsGroupConroller.updateIndicatorsValues
);

apiRouter.get('/metrics', MetricController.getMetrics);
apiRouter.get('/metrics/:id', MetricController.getMetricById);
apiRouter.post('/metrics',
  Validator.createMetricSchema,
  MetricController.createMetric
);
apiRouter.patch('/metrics/:id',
  Validator.updateMetricSchema,
  MetricController.updateMetric
);
apiRouter.delete('/metrics/:id', MetricController.deleteMetric);
apiRouter.post('/metrics/:id/indicators',
  Validator.addIndicatorToMetricSchema,
  MetricController.addIndicatorToMetric
);

apiRouter.delete('/indicators/:id',
  Validator.deleteIndicatorSchema,
  MetricIndicatorController.deleteIndicator
);
apiRouter.patch('/indicators/:id',
  Validator.updateIndicatorTextSchema,
  MetricIndicatorController.updateIndicatorText
);

router.use((error, req, res, next) => {
  let status = 500;
  let message = 'Ошибка сервера';

  if (error instanceof ErrorWithStatusCode) {
    status = error.statusCode;
    message = error.message;
  }
  console.error(error);
  res.status(status).send({ message });
})