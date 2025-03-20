import express from 'express';
import path from 'path';
import { getObjectsGroupsList, getObjectsGroupById } from '../controllers/objectsGroupsController.js';
import { corsMiddleware } from '../middlewares/cors.js';
export const router = express.Router();

router.use(express.static(path.resolve('public')));
router.use(corsMiddleware);

router.get('/', (req, res) => res.sendFile(path.resolve('public', 'index.html')));

// API router
const apiRouter = express.Router();
router.use('/api-v1', apiRouter);

apiRouter.get('/objects-groups', getObjectsGroupsList);
apiRouter.get('/objects-groups/:id', getObjectsGroupById);