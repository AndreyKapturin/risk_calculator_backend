import * as MetricService from '../services/metricService.js';

export const createMetric = (req, res) => {
  const metricId = MetricService.create(req.body.metric);
  res.status(201).json({ id: metricId });
}

export const getAllMetricsWithIndicators = (req, res) => {
  const metrics = MetricService.getAllWithIndicators();
  res.status(200).json(metrics);
}

export const updateMetric = (req, res) => {
  MetricService.update(req.params.id, req.body.metric);
  res.sendStatus(200);
}

export const addIndicatorToMetric = (req, res) => {
  const indicatorId = MetricService.addIndicator(req.params.id, req.body.indicator);
  res.status(201).json({ id: indicatorId });
}