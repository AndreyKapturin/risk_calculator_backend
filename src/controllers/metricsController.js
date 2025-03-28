import { DB } from "../database/index.js";

export const createMetric = (req, res) => {
  const { type, name, indicators } = req.body;
  
  try {
    const createMetricTransaction = DB.transaction((type, name, indicators) => {
      const { lastInsertRowid: metricId } = DB.prepare('INSERT INTO metrics (type, name) VALUES (?, ?)').run(type, name);
      indicators.forEach((i) => {
        DB.prepare('INSERT INTO metric_indicators (metric_id, text) VALUES (?, ?)').run(metricId, i.text);
      });
      return metricId;
    });

    const metricId = createMetricTransaction(type, name, indicators);
    res.status(201).json({ id: metricId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при создании метрики' });
  }
}

export const getAllMetrics = (req, res) => {
  try {
    const metrics = DB.prepare('SELECT * FROM metrics').all()
    .map((metric) => {
      const indicators = DB.prepare('SELECT id, text FROM metric_indicators mi WHERE mi.metric_id = ?').all(metric.id);
      metric.indicators = indicators;
      return metric;
    });
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при получении метрик' });
  }
}

export const updateMetric = (req, res) => {
  const metricId = Number(req.params.id);
  const { type, name } = req.body;

  if (Number.isNaN(metricId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const { changes } = DB.prepare('UPDATE metrics SET type = ?, name = ? WHERE id = ?').run(type, name, metricId);

    if (changes === 0) {
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
    const { lastInsertRowid } = DB.prepare('INSERT INTO metric_indicators (metric_id, text) VALUES (?, ?)').run(metricId, text);
    res.status(201).json({ id: lastInsertRowid, text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении метрики' });
  }
}

export const deleteIndicatorFromMetric = (req, res) => {
  const metricId = Number(req.params.metricId);
  const indicatorId = Number(req.params.indicatorId);
  
  if (Number.isNaN(metricId || Number.isNaN(indicatorId))) {
    res.status(400).json({ message: 'Параметр "medticId" или "indicatorId" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const { changes } = DB.prepare('DELETE FROM metric_indicators WHERE id = ?').run(indicatorId);
    console.log(changes);
    
    if (changes === 0) {
      res.status(404).json({ message: `Нет записей в таблицах для индикатора с id ${indicatorId} у метрики с id ${metricId}` });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при удалении метрики' });
  }
}