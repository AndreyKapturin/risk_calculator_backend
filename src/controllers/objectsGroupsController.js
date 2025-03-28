import { DB } from "../database/index.js";

export const getObjectsGroupsList = (req, res) => {
  try {
    const objectsGroups = DB.prepare('SELECT id, name FROM objects_groups').all();
    res.json(objectsGroups);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера при получении списка групп объектов' });
  }
}

export const getObjectsGroupById = (req, res) => {
  const objectGroupId = Number(req.params.id);

  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const objectsGroup = DB.prepare('SELECT * FROM objects_groups WHERE id = ?').get(objectGroupId);

    if (!objectsGroup) {
      res.status(404).send({ message: `Группа объектов с id ${objectGroupId} не найдена` });
      return;
    }

    const metrics = DB.prepare('SELECT m.* FROM metrics m LEFT JOIN objects_groups_metrics ogm ON ogm.objects_group_id = ? WHERE ogm.metric_id = m.id')
    .all(objectGroupId)
    .map((metric) => {
      const indicators = DB.prepare(
        `SELECT 
          mi.id, mi.text, miv.value
          FROM metric_indicators mi
          LEFT JOIN metric_indicators_values miv ON miv.metric_indicator_id = mi.id AND miv.objects_group_id = ?
          WHERE mi.metric_id = ? AND miv.value IS NOT NULL;`)
      .all(objectGroupId, metric.id);
      metric.indicators = indicators;
      return metric;
    });

    objectsGroup.metrics = metrics;
    res.status(200).json(objectsGroup);
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Ошибка сервера при выполнении запроса' });
  }
}

export const addMetricToObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.id);
  const metric = req.body;
  
  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    const addMetricTransaction = DB.transaction((objectGroupId, metricId, indicators) => {
      DB.prepare('INSERT INTO objects_groups_metrics (objects_group_id, metric_id) VALUES (?, ?)').run(objectGroupId, metricId);
      indicators.forEach(({ id, value }) => {
        DB.prepare('INSERT INTO metric_indicators_values (objects_group_id, metric_indicator_id, value) VALUES (?, ?, ?)').run(objectGroupId, id, value);
      });
    });

    addMetricTransaction(objectGroupId, metric.id, metric.indicators);

    res.sendStatus(201);
  } catch (error) {
    console.error('Ошибка сервера при добавлении метрики в группу объекта', error);
    res.status(500).json({ message: 'Ошибка сервера при добавлении метрики в группу объекта' })
  }
}

export const updateIndicatorsValuesForObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.id);
  const indicators = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    const updateIndicatorsTransaction = DB.transaction((objectGroupId, indicators) => {
      indicators.forEach(({ id, value }) => {
        DB.prepare('INSERT OR REPLACE INTO metric_indicators_values (objects_group_id, metric_indicator_id, value) VALUES (?, ?, ?);')
        .run(objectGroupId, id, value);
      });
    })

    updateIndicatorsTransaction(objectGroupId, indicators);
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка сервера при обновлении значений метрик', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении значений метрик'})
  }
}

export const deleteMetricFromObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.objectsGroupId);
  const metricId = Number(req.params.metricId);

  if (Number.isNaN(objectGroupId) || Number.isNaN(metricId)) {
    res.status(400).json({ message: 'Параметр "objectGroupId" или "metricId" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    const deleteMetricTransaction = DB.transaction((objectGroupId, metricId) => {
      const { changes: metricRows } = DB.prepare('DELETE FROM objects_groups_metrics WHERE objects_group_id = ? AND metric_id = ?')
      .run(objectGroupId, metricId);
      const { changes: valuesRows } = DB.prepare('DELETE FROM metric_indicators_values WHERE objects_group_id = ? AND metric_indicator_id IN (SELECT id FROM metric_indicators WHERE metric_id = ?)')
      .run(objectGroupId, metricId);

      return metricRows === 0 && valuesRows === 0;
    })

    const isNotDeleted = deleteMetricTransaction(objectGroupId, metricId);

    if (isNotDeleted) {
      res.status(404).json({ message: `Нет записей в таблицах для метрики с id ${metricId} у группы с id ${objectGroupId}` });
      return;
    }
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка сервера при удалении метрики у группы объектов', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении метрики у группы объектов' });
  }
}

export const updateObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.id);
  const valuesForUpdate = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const { values, setTemplates } = Object.entries(valuesForUpdate).reduce((res, [ key, value ]) => {
      res.values.push(value);
      res.setTemplates.push(`${key} = ?`);
      return res;
    } ,{ values: [], setTemplates: [] });

    values.push(objectGroupId);

    const { changes } = DB.prepare(`UPDATE objects_groups SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);

    if (changes === 0) {
      res.status(404).json({ message: `Группа с id ${objectGroupId} не найдена` });
      return
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка при обновлении записи о группе объектов', error);
    res.sendStatus(500);
  }
}