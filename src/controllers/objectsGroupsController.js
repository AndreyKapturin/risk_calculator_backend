import Joi from 'joi';
import * as ObjectsGroupService from '../services/objectsGroupService.js';
import { VALIDATE_ERROR_MESSAGES } from '../utils/constants.js';

const getObjectsGroupByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const updateObjectsGroupSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  }),
  body: Joi.object({
    objectsGroup: Joi.object({
      name: Joi.string().min(1),
      socialDamagePotencialScore: Joi.number(),
      materialDamagePotencialScore: Joi.number()
    }).required().min(1)
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const addMetricToObjectsGroupSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  }),
  body: Joi.object({
    metric: Joi.object({
      id: Joi.number().min(1).required(),
      indicators: Joi.array().required().min(2).items(Joi.object({
        id: Joi.number().min(1).required(),
        value: Joi.number().required(),
        text: Joi.string()
      })).required()
    }).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const removeMetricFromObjectsGroupSchema = Joi.object({
  params: Joi.object({
    objectsGroupId: Joi.number().min(1).required(),
    metricId: Joi.number().min(1).required(),
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const updateIndicatorsValuesSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required(),
  }),
  body: Joi.object({
    indicators: Joi.array().required().items(Joi.object({
      id: Joi.number().min(1).required(),
      text: Joi.string(),
      value: Joi.number().required(),
    })).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

export const addMetricToObjectsGroup = (req, res) => {
  const { error } = addMetricToObjectsGroupSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  ObjectsGroupService.addMetricToObjectsGroup(req.params.id, req.body.metric);
  res.sendStatus(201);
}

export const getObjectsGroupsList = (req, res) => {
  const objectsGroups = ObjectsGroupService.getObjectsGroupsList();
  res.json(objectsGroups);
}

export const getObjectsGroupById = (req, res) => {
  const { error } = getObjectsGroupByIdSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const objectsGroupId = req.params.id;
  const objectsGroup = ObjectsGroupService.getObjectsGroupById(objectsGroupId);

  if (!objectsGroup) {
    res.status(404).json({ message: `Группа объектов с id ${objectsGroupId} не найдена`})
    return;
  }

  res.status(200).json(objectsGroup);
}

export const updateObjectsGroup = (req, res) => {
  const { error } = updateObjectsGroupSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const updatedObjectsGroup = ObjectsGroupService.updateObjectsGroup(req.params.id, req.body.objectsGroup);
  if (!updatedObjectsGroup) {
    res.status(422).json({ message: 'Группа объектов не обновлена' });
    return;
  }
  res.status(201).json(updatedObjectsGroup);
}

export const updateIndicatorsValues = (req, res) => {
  const { error } = updateIndicatorsValuesSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const isUpdated = ObjectsGroupService.updateIndicatorsValues(req.params.id, req.body.indicators);
  if (isUpdated) {
    res.status(201).json(req.body.indicators);
  } else {
    res.status(422).json({ message: 'Не удалось обновить значение индикаторов' });
  }
}

export const removeMetricFromObjectsGroup = (req, res) => {
  const { error } = removeMetricFromObjectsGroupSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const isRemoved = ObjectsGroupService.removeMetric(req.params.objectsGroupId, req.params.metricId);
  if (isRemoved) {
    res.status(200).json({ id: req.params.metricId });
  } else {
    res.status(422).json({ message: 'Не удалось удалить метрику, либо она уже удалена' });
  }
}