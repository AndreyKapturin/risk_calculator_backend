import { connection } from "../database/index.js";

export const createMetric = async (req, res) => {
  const { type, name, indicators } = req.body;
  
  try {
    const [ { insertId: metricId } ] = await connection.query(`INSERT INTO metrics (type, name) VALUES (?, ?)`, [ type, name ]);

    const indicatorsIds = await Promise.all(indicators.map(async (i) => {
      const [ { insertId: indicatorId } ] = await connection.query('INSERT INTO metric_indicators (metric_id, text) VALUES (?, ?)', [ metricId, i.text ]);
      return indicatorId;
    }));

    res.status(201).json(metricId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при создании метрики' });
  }
}

export const getAllMetrics = async (req, res) => {
  try {
    const [ metrics ] = await connection.query('SELECT * FROM metrics');
    const metricsWithIndicators = await Promise.all(metrics.map(async (metric) => {
      const [ indicators ] = await connection.query('SELECT id, text FROM metric_indicators mi WHERE mi.metric_id = ?', metric.id);
      metric.indicators = indicators;
      return metric;
    }));
    res.status(200).json(metricsWithIndicators);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при получении метрик' });
  }
}

export const updateMetric = async (req, res) => {
  const metricId = Number(req.params.id);
  const { type, name } = req.body;

  if (Number.isNaN(metricId)) {
    res.status(400).send({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const [ { affectedRows } ] = await connection.query('UPDATE metrics SET type = ?, name = ? WHERE id = ?', [ type, name, metricId ]);

    if (affectedRows > 0) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: 'Метрика не найдена' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении метрики' });
  }
}

export const addIndicatorToMetric = async (req, res) => {
  const metricId = Number(req.params.id);
  const { text } = req.body;

  if (Number.isNaN(metricId)) {
    res.status(400).send({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const [ { insertId } ] = await connection.query('INSERT INTO metric_indicators (metric_id, text) VALUES (?, ?)', [ metricId, text ]);
    res.status(201).json({ id: insertId, text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении метрики' });
  }
}

export const deleteIndicatorFromMetric = async (req, res) => {
  const metricId = Number(req.params.metricId);
  const indicatorId = Number(req.params.indicatorId);
  
  if (Number.isNaN(metricId || Number.isNaN(indicatorId))) {
    res.status(400).send({ message: 'Параметр "medticId" или "indicatorId" имеет неверный формат или отсутствует'});
    return;
  }
  
  try {
    const [ { affectedRows } ] = await connection.query('DELETE FROM metric_indicators WHERE id = ?', [ indicatorId ]);

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Неверные параметры индикатора метрики'});
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении метрики' });
  }
}