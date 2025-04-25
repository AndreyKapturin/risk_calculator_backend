import * as MetricService from '../services/metricService.js';

export const getMetricById = (req, res) => {
  const metricId = req.params.id;
  const metric = MetricService.getMetricById(metricId);
  if (!metric) {
    res.status(404).json({ message: `Метрика с id ${metricId} не найдена` });
    return
  };
  res.status(200).json(metric);
}

export const createMetric = (req, res) => {
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
  const updatedMetric = MetricService.updateMetric(req.params.id, req.body.metric);
  if (!updatedMetric) {
    res.status(422).json({ message: 'Ошибка при обновлении метрики '});
  }
  res.status(201).json(updatedMetric);
}

export const deleteMetric = (req, res) => {
  const metricId = req.params.id;
  const isDeleted = MetricService.deleteMetric(metricId);
  
  if (isDeleted) {
    res.status(200).json({ id: metricId });
  } else {
    res.status(200).json({ message: `Нет записей в таблицах для метрики с id ${metricId}` });
  }
}

export const addIndicatorToMetric = (req, res) => {
  try {
    const createdIndicator = MetricService.addIndicatorToMetric(req.params.id, req.body.indicator);
    res.status(201).json(createdIndicator);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}