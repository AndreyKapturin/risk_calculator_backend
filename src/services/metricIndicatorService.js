import { DB } from "../database/index.js";
import { ErrorWithStatusCode } from "../utils/ErrorWithStatusCode.js";

export const create = (metricId, indicator) => {
  const { text } = indicator;
  const { lastInsertRowid } = DB.prepare('INSERT INTO metric_indicators (metric_id, text) VALUES (?, ?)').run(metricId, text);
  return lastInsertRowid;
}

export const getAllForMetric = (metricId) => {
  return DB.prepare('SELECT id, text FROM metric_indicators mi WHERE mi.metric_id = ?').all(metricId);
}

export const getAllWithValuesForMetricsAndObjectsGroup = (objectGroupId, metricId) => {
  return DB.prepare(`
    SELECT mi.id, mi.text, miv.value
    FROM metric_indicators mi
    LEFT JOIN metric_indicators_values miv ON miv.metric_indicator_id = mi.id AND miv.objects_group_id = ?
    WHERE mi.metric_id = ? AND miv.value IS NOT NULL;`)
    .all(objectGroupId, metricId);
}

export const update = (indicatorId, indicator) => {
  const { text } = indicator;
  const { changes } = DB.prepare('UPDATE metric_indicators SET text = ? WHERE id = ?').run(text, indicatorId);
  if (changes === 0) throw new ErrorWithStatusCode(404, `Нет записей в таблицах для индикатора с id ${indicatorId}`);
}

export const deleteIndicator = (indicatorId) => {
  const { changes } = DB.prepare('DELETE FROM metric_indicators WHERE id = ?').run(indicatorId);
  if (changes === 0) throw new ErrorWithStatusCode(404, `Нет записей в таблицах для индикатора с id ${indicatorId}`);
}