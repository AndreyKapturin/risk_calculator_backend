import { DB } from "../database/index.js";
import { convertCamelToSnakeCase } from "../utils/caseConverter.js";
import { ErrorWithStatusCode } from "../utils/ErrorWithStatusCode.js";
import * as MetricIndicatorService from "./metricIndicatorService.js";

export const create = ({ type, name, indicators }) => {
  return (DB.transaction((type, name, indicators) => {
    const { lastInsertRowid: metricId } = DB.prepare('INSERT INTO metrics (type, name) VALUES (?, ?)').run(type, name);
    indicators.forEach(indicator => MetricIndicatorService.create(metricId, indicator.text));
    return metricId;
  }))(type, name, indicators)
};

export const update = (metricId, dataForUpdate) => {
  const { values, setTemplates } = Object.entries(dataForUpdate).reduce((res, [ key, value ]) => {
    const snakeCaseKey = convertCamelToSnakeCase(key);
    res.values.push(value);
    res.setTemplates.push(`${snakeCaseKey} = ?`);
    return res;
  } ,{ values: [], setTemplates: [] });

  values.push(metricId);

  const { changes } = DB.prepare(`UPDATE metrics SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  if (changes === 0) throw new ErrorWithStatusCode(404, `Значения метрики с id ${objectGroupId} не обновлены`);
}

export const getById = (metricId) => {
  const metric = DB.prepare('SELECT * FROM metrics WHERE id = ?').get(metricId);
  if (!metric) throw new ErrorWithStatusCode(404, `Метрика с id ${metricId} не найдена`);
  return metric;
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

export const addIndicator = (metricId, indicator) => {
  getById(metricId);
  return MetricIndicatorService.create(metricId, indicator);
}

