import { DB } from "../database/index.js";
import * as MetricIndicatorService from "./metricIndicatorService.js";

export const create = (type, name, indicators) => (DB.transaction((type, name, indicators) => {
  const { lastInsertRowid: metricId } = DB.prepare('INSERT INTO metrics (type, name) VALUES (?, ?)').run(type, name);
  
  indicators.forEach(indicator => {
    MetricIndicatorService.create(metricId, indicator.text);
  });

  return metricId;

}))(type, name, indicators);

export const update = (metricId, dataForUpdate) => {
  const { values, setTemplates } = Object.entries(dataForUpdate).reduce((res, [ key, value ]) => {
    res.values.push(value);
    res.setTemplates.push(`${key} = ?`);
    return res;
  } ,{ values: [], setTemplates: [] });

  values.push(metricId);

  const { changes } = DB.prepare(`UPDATE metrics SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  return changes > 0;
}

export const getAllWithIndicators = () => {
  return DB.prepare('SELECT * FROM metrics').all()
  .map((metric) => {
    const indicators = MetricIndicatorService.getAllForMetric(metric.id);
    metric.indicators = indicators;
    return metric;
  });
}

export const getAllWithIndicatorsForObjectsGroup = (objectsGroupId) => {
  return DB.prepare(
    `SELECT m.* 
    FROM metrics m
    LEFT JOIN objects_groups_metrics ogm ON ogm.objects_group_id = ?
    WHERE ogm.metric_id = m.id`).all(objectsGroupId)
  .map((metric) => {
    metric.indicators = MetricIndicatorService.getAllWithValuesForMetricsAndObjectsGroup(objectsGroupId, metric.id);
    return metric;
  });
}

export const addIndicator = (metricId, text) => {
  return MetricIndicatorService.create(metricId, text);
}

