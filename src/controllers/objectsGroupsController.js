import { connection } from "../database/index.js";

export const getObjectsGroupsList = async (req, res) => {
  try {
    const [ objectsGroups ] = await connection.query('SELECT id, name FROM objects_groups');
    res.json(objectsGroups);
  } catch (error) {
    res.status(500).send({ error: 'Something failed!' });
  }
}

export const getObjectsGroupById = async (req, res) => {
  const objectGroupId = Number(req.params.id);

  if (Number.isNaN(objectGroupId)) {
    res.status(400).send({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const [ rows ] = await connection.query('SELECT * FROM objects_groups WHERE id = ?', objectGroupId);
    const objectsGroup = rows[0];

    if (!objectsGroup) {
      res.status(404).send({ message: `Группа объектов с id ${objectGroupId} не найдена` });
      return;
    }

    const [ metrics ] = await connection.query(`SELECT m.* FROM metrics m LEFT JOIN objects_groups_metrics ogm ON ogm.objects_group_id = ? WHERE ogm.metric_id = m.id`, objectGroupId);

    const metricsWithIndicators = await Promise.all(metrics.map(async (metric) => {
      const [ indicators ] = await connection.query(
        `SELECT 
          mi.id, mi.text, miv.value
          FROM metric_indicators mi
          LEFT JOIN metric_indicators_values miv ON miv.metric_indicator_id = mi.id AND miv.objects_group_id = ?
          WHERE mi.metric_id = ? AND miv.value IS NOT NULL;`, [objectGroupId, metric.id]);
      metric.indicators = indicators;
      return metric;
    }));

    objectsGroup.metrics = metricsWithIndicators;
    res.status(200).json(objectsGroup);
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Ошибка сервера при выполнении запроса' });
  }
}

export const addMetricToObjectsGroup = async (req, res) => {
  const objectGroupId = Number(req.params.id);
  const metric = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).send({ message: 'Параметр "id" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    await connection.beginTransaction();
    await connection.query('INSERT INTO objects_groups_metrics (objects_group_id, metric_id) VALUES (?, ?)', [objectGroupId, metric.id]);
    await Promise.all(metric.indicators.map(async ({ id, value })=> {
      await connection.query('INSERT INTO metric_indicators_values (objects_group_id, metric_indicator_id, value) VALUES (?, ?, ?)', [objectGroupId, id, value])
    }));
    await connection.commit();
    res.sendStatus(201);
  } catch (error) {
    await connection.rollback();
    console.error('Ошибка сервера при добавлении метрики в группу объекта', error);
    res.status(500).send({ message: 'Ошибка сервера при добавлении метрики в группу объекта'})
  }
}

export const updateIndicatorsValuesForObjectsGroup = async (req, res) => {
  const objectGroupId = Number(req.params.id);
  const indicators = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).send({ message: 'Параметр "id" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    await Promise.all(indicators.map(async ({ id, value })=> {
      return await connection.query('INSERT INTO metric_indicators_values (objects_group_id, metric_indicator_id, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?;', [objectGroupId, id, value, value]);
    }));
    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка сервера при обновлении значений метрик', error);
    res.status(500).send({ message: 'Ошибка сервера при обновлении значений метрик'})
  }
}

export const deleteMetricFromObjectsGroup = async (req, res) => {
  const objectGroupId = Number(req.params.objectsGroupId);
  const metricId = Number(req.params.metricId);

  if (Number.isNaN(objectGroupId) || Number.isNaN(metricId)) {
    res.status(400).send({ message: 'Параметр "objectGroupId" или "metricId" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    await connection.beginTransaction();
    const [ { affectedRows: metricsRows } ] = await connection.query('DELETE FROM objects_groups_metrics WHERE objects_group_id = ? AND metric_id = ?', [ objectGroupId, metricId ]);
    const [ { affectedRows: valuesRows } ] = await connection.query('DELETE FROM metric_indicators_values WHERE objects_group_id = ? AND metric_indicator_id IN (SELECT id FROM metric_indicators WHERE metric_id = ?)', [ objectGroupId, metricId ]);

    if (metricsRows === 0 || valuesRows === 0) {
      await connection.rollback();
      res.status(404).json({ message: 'Неверные параметры группы объектов или метрики'});
      return;
    }

    await connection.commit();
    res.sendStatus(204);
  } catch (error) {
    await connection.rollback()
    console.error('Ошибка сервера при удалении метрики у группы объектов', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении метрики у группы объектов'})
  }
}

export const updateObjectsGroup = async (req, res) => {
  const objectGroupId = Number(req.params.id);
  const valuesForUpdate = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).send({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const { values, setTemplates } = Object.entries(valuesForUpdate).reduce((res, [ key, value ]) => {
      res.values.push(value);
      res.setTemplates.push(`${key} = ?`);
      return res;
    } ,{ values: [], setTemplates: [] });

    values.push(objectGroupId);

    const sql = `UPDATE objects_groups SET ${setTemplates.join(', ')} WHERE id = ?`;
    const [ { affectedRows } ] = await connection.query(sql, values);

    if (affectedRows === 0) {
      res.status(404).json({ message: `Группа с id ${objectGroupId} не найдена` });
      return
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка при обновлении записи о группе объектов', error);
    res.sendStatus(500);
  }
}