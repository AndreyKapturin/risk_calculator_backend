import { DB } from "../database/index.js";

export const createIndicator = (metricId, indicator) => {
  const { text } = indicator;
  const { lastInsertRowid } = DB.prepare('INSERT INTO metric_indicators (metric_id, text) VALUES (?, ?)').run(metricId, text);
  return { text, id: lastInsertRowid };
}

export const getIndicatorsByMetricId = (metricId) => {
  return DB.prepare('SELECT id, text FROM metric_indicators mi WHERE mi.metric_id = ?').all(metricId);
}

export const getIndicatorsWithValues = (objectGroupId, metricId) => {
  return DB.prepare(`
    SELECT mi.id, mi.text, miv.value
    FROM metric_indicators mi
    LEFT JOIN metric_indicators_values miv ON miv.metric_indicator_id = mi.id AND miv.objects_group_id = ?
    WHERE mi.metric_id = ? AND miv.value IS NOT NULL;`)
    .all(objectGroupId, metricId);
}

export const updateIndicator = (indicatorId, indicator) => {
  const { text } = indicator;
  const { changes } = DB.prepare('UPDATE metric_indicators SET text = ? WHERE id = ?').run(text, indicatorId);
  if (changes === 0) {
    return false;
  }
  return { id: indicatorId, text };
}

export const deleteIndicator = (indicatorId) => {
  const { changes } = DB.prepare('DELETE FROM metric_indicators WHERE id = ?').run(indicatorId);
  return changes > 0;
}