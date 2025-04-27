import Joi from 'joi';
import * as MetricService from '../services/metricService.js';
import { METRIC_TYPES, VALIDATE_ERROR_MESSAGES } from '../utils/constants.js';

const getMetricByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const createMetricSchema = Joi.object({
  body: Joi.object({
    metric: Joi.object({
      type: Joi.string().required().valid(...METRIC_TYPES),
      name: Joi.string().required().min(1).max(1024),
      indicators: Joi.array().required().items(Joi.object({
        text: Joi.string().required().min(1).max(512),
      }))
    }).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const updateMetricSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  }),
  body: Joi.object({
    metric: Joi.object({
      type: Joi.string().valid(...METRIC_TYPES),
      name: Joi.string().min(1).max(1024)
    }).required().min(1)
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const deleteMetricSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const addIndicatorToMetricSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  }),
  body: Joi.object({
    indicator: Joi.object({
      text: Joi.string().required()
    }).required()
  })
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

export const getMetricById = (req, res) => {
  const { error } = getMetricByIdSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const metricId = req.params.id;
  const metric = MetricService.getMetricById(metricId);
  if (!metric) {
    res.status(404).json({ message: `Метрика с id ${metricId} не найдена` });
    return
  };
  res.status(200).json(metric);
}

export const createMetric = (req, res) => {
  const { error } = createMetricSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const createdMetric = MetricService.createMetric(req.body.metric);
  if (!createdMetric) {
    res.status(422).json({ message: 'Ошибка при создании метрики' });
    return
  }
  res.status(201).json(createdMetric);
}

export const getMetrics = (req, res) => {
  const metrics = MetricService.getMetrics();
  res.status(200).json(metrics);
}

export const updateMetric = (req, res) => {
  const { error } = updateMetricSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const updatedMetric = MetricService.updateMetric(req.params.id, req.body.metric);
  if (!updatedMetric) {
    res.status(422).json({ message: 'Ошибка при обновлении метрики '});
  }
  res.status(201).json(updatedMetric);
}

export const deleteMetric = (req, res) => {
  const { error } = deleteMetricSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const metricId = req.params.id;
  const isDeleted = MetricService.deleteMetric(metricId);
  
  if (isDeleted) {
    res.status(200).json({ id: metricId });
  } else {
    res.status(200).json({ message: `Нет записей в таблицах для метрики с id ${metricId}` });
  }
}

export const addIndicatorToMetric = (req, res) => {
  const { error } = addIndicatorToMetricSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  try {
    const createdIndicator = MetricService.addIndicatorToMetric(req.params.id, req.body.indicator);
    res.status(201).json(createdIndicator);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}