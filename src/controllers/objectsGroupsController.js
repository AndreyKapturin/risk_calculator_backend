import * as ObjectsGroupService from '../services/objectsGroupService.js';

export const addMetricToObjectsGroup = (req, res) => {
  ObjectsGroupService.addMetricToObjectsGroup(req.params.id, req.body.metric);
  res.sendStatus(201);
}

export const getObjectsGroupsList = (req, res) => {
  const objectsGroups = ObjectsGroupService.getObjectsGroupsList();
  res.json(objectsGroups);
}

export const getObjectsGroupById = (req, res) => {
  const objectsGroupId = req.params.id;
  const objectsGroup = ObjectsGroupService.getObjectsGroupById(objectsGroupId);

  if (!objectsGroup) {
    res.status(404).json({ message: `Группа объектов с id ${objectsGroupId} не найдена`})
    return;
  }

  res.status(200).json(objectsGroup);
}

export const updateObjectsGroup = (req, res) => {
  const updatedObjectsGroup = ObjectsGroupService.updateObjectsGroup(req.params.id, req.body.objectsGroup);
  if (!updatedObjectsGroup) {
    res.status(422).json({ message: 'Группа объектов не обновлена' });
    return;
  }
  res.status(201).json(updatedObjectsGroup);
}

export const updateIndicatorsValues = (req, res) => {
  const isUpdated = ObjectsGroupService.updateIndicatorsValues(req.params.id, req.body.indicators);
  if (isUpdated) {
    res.status(201).json(req.body.indicators);
  } else {
    res.status(422).json({ message: 'Не удалось обновить значение индикаторов' });
  }
}

export const removeMetricFromObjectsGroup = (req, res) => {
  const isRemoved = ObjectsGroupService.removeMetric(req.params.objectsGroupId, req.params.metricId);
  if (isRemoved) {
    res.status(200).json({ id: req.params.metricId });
  } else {
    res.status(422).json({ message: 'Не удалось удалить метрику, либо она уже удалена' });
  }
}