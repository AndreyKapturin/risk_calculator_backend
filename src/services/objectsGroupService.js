import { DB } from "../database/index.js";
import * as MetricService from './metricService.js';

export const getAllForList = () => {
  return DB.prepare('SELECT id, name FROM objects_groups').all();
}

export const getObjectsGroupWithMetricsById = (objectsGroupId) => {
  const objectsGroup = DB.prepare(`
    SELECT
    id,
    name,
    social_damage_potencial_score as socialDamagePotencialScore,
    material_damage_potencial_score as materialDamagePotencialScore
    FROM objects_groups WHERE id = ?`).get(objectsGroupId);

  if (!objectsGroup) {
    return null;
  }

  objectsGroup.metrics = MetricService.getAllWithIndicatorsForObjectsGroup(objectsGroup.id);
  return objectsGroup;
}

export const addMetric = (objectGroupId, metric) => (DB.transaction((objectGroupId, metric) => {
    DB.prepare('INSERT INTO objects_groups_metrics (objects_group_id, metric_id) VALUES (?, ?)')
      .run(objectGroupId, metric.id);
    
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

  return changes > 0;
}))(objectGroupId, indicators);

export const deleteMetric = (objectGroupId, metricId) => (DB.transaction((objectGroupId, metricId) => {
  const { changes: metricRows } = DB.prepare('DELETE FROM objects_groups_metrics WHERE objects_group_id = ? AND metric_id = ?')
    .run(objectGroupId, metricId);

  const { changes: valuesRows } = DB.prepare(`
    DELETE FROM metric_indicators_values
    WHERE objects_group_id = ? AND metric_indicator_id IN (SELECT id FROM metric_indicators WHERE metric_id = ?)`)
    .run(objectGroupId, metricId);

  return metricRows === 0 || valuesRows === 0;
}))(objectGroupId, metricId);

export const update = (objectGroupId, dataForUpdate) => {
  const { values, setTemplates } = Object.entries(dataForUpdate).reduce((res, [ key, value ]) => {
    res.values.push(value);
    res.setTemplates.push(`${key} = ?`);
    return res;
  }, { values: [], setTemplates: [] });

  values.push(objectGroupId);

  const { changes } = DB.prepare(`UPDATE objects_groups SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  return changes > 0;
}