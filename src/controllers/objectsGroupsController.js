import * as ObjectsGroupService from '../services/objectsGroupService.js';

export const addMetricToObjectsGroup = (req, res) => {
  ObjectsGroupService.addMetric(req.params.id, req.body.metric);
  res.sendStatus(201);
}

export const getObjectsGroupsList = (req, res) => {
  const objectsGroups = ObjectsGroupService.getAllForList();
  res.json(objectsGroups);
}

export const getObjectsGroupWithMetricsById = (req, res) => {
  const objectsGroup = ObjectsGroupService.getObjectsGroupWithMetricsById(req.params.id);
  res.status(200).json(objectsGroup);
}

export const updateObjectsGroup = (req, res) => {
  ObjectsGroupService.update(req.params.id, req.body.data);
  res.sendStatus(204);
}

export const updateIndicatorsValuesForObjectsGroup = (req, res) => {
  ObjectsGroupService.updateIndicatorsValues(req.params.id, req.body.indicators);
  res.sendStatus(204);
}

export const deleteMetricFromObjectsGroup = (req, res) => {
  ObjectsGroupService.deleteMetric(req.params.objectsGroupId, req.params.metricId);  
  res.sendStatus(204);
}