import * as MetricModel from '../services/metricService.js';

export const createMetric = (req, res) => {
  try {
    const { type, name, indicators } = req.body;
    const metricId = MetricModel.create(type, name, indicators);
    res.status(201).json({ id: metricId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при создании метрики' });
  }
}

export const getAllMetricsWithIndicators = (req, res) => {
  try {
    const metrics = MetricModel.getAllWithIndicators();
    res.status(200).json(metrics);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Ошибка сервера при получении метрик' });
  }
}

export const updateMetric = (req, res) => {
  const metricId = Number(req.params.id);
  const dataForUpdate = req.body;

  if (Number.isNaN(metricId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const isUpdated = MetricModel.update(metricId, dataForUpdate);

    if (!isUpdated) {
      res.status(404).json({ message: 'Метрика не найдена' });
      return;
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении метрики' });
  }
}

export const addIndicatorToMetric = (req, res) => {
  const metricId = Number(req.params.id);
  const { text } = req.body;

  if (Number.isNaN(metricId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const indicatorId = MetricModel.addIndicator(metricId, text);
    res.status(201).json({ id: indicatorId, text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении метрики' });
  }
}