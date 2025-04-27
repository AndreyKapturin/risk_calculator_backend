import { DB } from "../database/index.js";
import * as MetricService from './metricService.js';
import { ErrorWithStatusCode } from "../utils/ErrorWithStatusCode.js";
import { convertCamelToSnakeCase } from "../utils/caseConverter.js";

export const getObjectsGroupsList = () => {
  return DB.prepare('SELECT id, name FROM objects_groups').all();
}

export const getObjectsGroupById = (objectsGroupId) => {
  const objectsGroup = DB.prepare(`
    SELECT
    id,
    name,
    social_damage_potencial_score as socialDamagePotencialScore,
    material_damage_potencial_score as materialDamagePotencialScore
    FROM objects_groups WHERE id = ?`).get(objectsGroupId);

  if (!objectsGroup) return null;

  objectsGroup.metrics = MetricService.getMetricsByObjectsGroupId(objectsGroup.id);
  return objectsGroup;
}

export const addMetricToObjectsGroup = (objectGroupId, metric) => (DB.transaction((objectGroupId, metric) => {
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

export const removeMetric = (objectGroupId, metricId) => (DB.transaction((objectGroupId, metricId) => {
  const { changes: metricRows } = DB.prepare('DELETE FROM objects_groups_metrics WHERE objects_group_id = ? AND metric_id = ?')
    .run(objectGroupId, metricId);

  const { changes: valuesRows } = DB.prepare(`
    DELETE FROM metric_indicators_values
    WHERE objects_group_id = ? AND metric_indicator_id IN (SELECT id FROM metric_indicators WHERE metric_id = ?)`)
    .run(objectGroupId, metricId);
    return metricRows !== 0 || valuesRows !== 0;
}))(objectGroupId, metricId);

export const updateObjectsGroup = (objectGroupId, dataForUpdate) => {
  getObjectsGroupById(objectGroupId);

  const { values, setTemplates } = Object.entries(dataForUpdate).reduce((res, [ key, value ]) => {
    const snakeCaseKey = convertCamelToSnakeCase(key);
    res.values.push(value);
    res.setTemplates.push(`${snakeCaseKey} = ?`);
    return res;
  }, { values: [], setTemplates: [] });

  values.push(objectGroupId);

  const { changes } = DB.prepare(`UPDATE objects_groups SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  if (changes === 0) return null;
  
  const updatedObjectsGroup = getObjectsGroupById(objectGroupId);
  return updatedObjectsGroup;
}