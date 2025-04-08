import { DB } from "../database/index.js";
import * as MetricService from './metricService.js';
import { ErrorWithStatusCode } from "../utils/ErrorWithStatusCode.js";

export const getAllForList = () => {
  return DB.prepare('SELECT id, name FROM objects_groups').all();
}

export const getObjectsGroupById = (objectsGroupId) => {
  const objectsGroup = DB.prepare(`SELECT * FROM objects_groups WHERE id = ?`).get(objectsGroupId);
  if (!objectsGroup) throw new ErrorWithStatusCode(404, `Группа объектов с id ${objectsGroupId} не найдена`);
  return objectsGroup;
}

export const getObjectsGroupWithMetricsById = (objectsGroupId) => {
  const objectsGroup = DB.prepare(`
    SELECT
    id,
    name,
    social_damage_potencial_score as socialDamagePotencialScore,
    material_damage_potencial_score as materialDamagePotencialScore
    FROM objects_groups WHERE id = ?`).get(objectsGroupId);

  if (!objectsGroup) throw new ErrorWithStatusCode(404, `Группа объектов с id ${objectsGroupId} не найдена`);

  objectsGroup.metrics = MetricService.getAllWithIndicatorsForObjectsGroup(objectsGroup.id);
  return objectsGroup;
}

export const addMetric = (objectGroupId, metric) => (DB.transaction((objectGroupId, metric) => {
  if (Number.isNaN(Number(metric.id))) throw new ErrorWithStatusCode(400, 'В теле запроса параметр "id" должен быть числом');
  if (!Array.isArray(metric.indicators)) throw new ErrorWithStatusCode(400, 'В теле запроса параметр "indicators" должен быть массивом');

  DB.prepare('INSERT INTO objects_groups_metrics (objects_group_id, metric_id) VALUES (?, ?)').run(objectGroupId, metric.id);
  
  const setValueToMetricIndicatorQuery = DB.prepare('INSERT INTO metric_indicators_values (objects_group_id, metric_indicator_id, value) VALUES (?, ?, ?)');
  
  metric.indicators.forEach(({ id, value }) => {
      setValueToMetricIndicatorQuery.run(objectGroupId, id, value);
  });
})
)(objectGroupId, metric);

export const updateIndicatorsValues = (objectGroupId, indicators) => (DB.transaction((objectGroupId, indicators) => {
  const updateIndicatorsValuesQuery = DB.prepare('INSERT OR REPLACE INTO metric_indicators_values (objects_group_id, metric_indicator_id, value) VALUES (?, ?, ?)');

  const changes = indicators.reduce((totalChanges, indicator) => {
    const { changes } = updateIndicatorsValuesQuery.run(objectGroupId, indicator.id, indicator.value);
    totalChanges += changes;
    return totalChanges;
  }, 0);

  if (changes === 0) throw new ErrorWithStatusCode(404, `Значения индикаторов для группы объектов с id ${objectGroupId} не найдены`);
}))(objectGroupId, indicators);

export const deleteMetric = (objectGroupId, metricId) => (DB.transaction((objectGroupId, metricId) => {
  const { changes: metricRows } = DB.prepare('DELETE FROM objects_groups_metrics WHERE objects_group_id = ? AND metric_id = ?')
    .run(objectGroupId, metricId);

  const { changes: valuesRows } = DB.prepare(`
    DELETE FROM metric_indicators_values
    WHERE objects_group_id = ? AND metric_indicator_id IN (SELECT id FROM metric_indicators WHERE metric_id = ?)`)
    .run(objectGroupId, metricId);

  if (metricRows === 0 && valuesRows === 0) throw new ErrorWithStatusCode(404, `Нет записей в таблицах для метрики с id ${metricId} у группы с id ${objectGroupId}`);
}))(objectGroupId, metricId);

export const update = (objectGroupId, dataForUpdate) => {
  const keysAndValues = Object.entries(dataForUpdate);
  if (keysAndValues.length === 0) throw new ErrorWithStatusCode(400, 'Нет данных для обновления');
  // вспомогательная функция для фильтрации ключей и типов значений входящего объекта
  // не пропустить параметры не входящие в состав таблицы
  // проверять соответствие типов
  
  getObjectsGroupById(objectGroupId);

  const { values, setTemplates } = keysAndValues.reduce((res, [ key, value ]) => {
    res.values.push(value);
    res.setTemplates.push(`${key} = ?`);
    return res;
  }, { values: [], setTemplates: [] });

  values.push(objectGroupId);

  const { changes } = DB.prepare(`UPDATE objects_groups SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  if (changes === 0) throw new ErrorWithStatusCode(404, `Значения метрики для группы с id ${objectGroupId} не обновлены`);
}