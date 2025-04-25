import { DB } from "../database/index.js";
import { convertCamelToSnakeCase } from "../utils/caseConverter.js";
import * as MetricIndicatorService from "./metricIndicatorService.js";

export const getMetricById = (metricId) => {
  const metric = DB.prepare('SELECT * FROM metrics WHERE id = ?').get(metricId);  
  if (!metric) return null;
  const indicators = MetricIndicatorService.getIndicatorsByMetricId(metricId);
  metric.indicators = indicators;
  return metric;
}

export const createMetric = ({ type, name, indicators }) => {
  const metricId = (DB.transaction((type, name, indicators) => {
    const { lastInsertRowid: metricId } = DB.prepare('INSERT INTO metrics (type, name) VALUES (?, ?)').run(type, name);
    indicators.forEach(indicator => MetricIndicatorService.createIndicator(metricId, indicator));
    return metricId;
  }))(type, name, indicators);

  const createdMetric = getMetricById(metricId);
  return createdMetric;
};

export const updateMetric = (metricId, dataForUpdate) => {
  const { values, setTemplates } = Object.entries(dataForUpdate).reduce((res, [ key, value ]) => {
    const snakeCaseKey = convertCamelToSnakeCase(key);
    res.values.push(value);
    res.setTemplates.push(`${snakeCaseKey} = ?`);
    return res;
  } ,{ values: [], setTemplates: [] });

  values.push(metricId);

  const { changes } = DB.prepare(`UPDATE metrics SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  if (changes === 0) return null;

  const updatedMetric = getMetricById(metricId);
  return updatedMetric;
}



export const getMetrics = () => {
  return DB.prepare('SELECT * FROM metrics').all()
  .map((metric) => {
    const indicators = MetricIndicatorService.getIndicatorsByMetricId(metric.id);
    metric.indicators = indicators;
    return metric;
  });
}

export const getMetricsByObjectsGroupId = (objectsGroupId) => {
  return DB.prepare(
    `SELECT m.* 
    FROM metrics m
    LEFT JOIN objects_groups_metrics ogm ON ogm.objects_group_id = ?
    WHERE ogm.metric_id = m.id`).all(objectsGroupId)
  .map((metric) => {
    metric.indicators = MetricIndicatorService.getIndicatorsWithValues(objectsGroupId, metric.id);
    return metric;
  });
}

export const deleteMetric = (metricId) => { 
  const { changes } = DB.prepare('DELETE FROM metrics WHERE id = ?').run(metricId);
  return changes > 0;
}

export const addIndicatorToMetric = (metricId, indicator) => {
  const metric = getMetricById(metricId);
  if (!metric) throw new Error(`Метрика с id ${metricId} не найдена`);
  const createdIndicator = MetricIndicatorService.createIndicator(metricId, indicator);
  return createdIndicator;
}

