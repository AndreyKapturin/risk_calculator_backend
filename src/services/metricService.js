import { DB } from "../database/index.js";
import { ErrorWithStatusCode } from "../utils/ErrorWithStatusCode.js";
import * as MetricIndicatorService from "./metricIndicatorService.js";

const METRIC_TYPES = ['risk indicators', 'good faith criteria'];

export const create = ({ type, name, indicators }) => {
  if (type === undefined) throw new ErrorWithStatusCode(400, 'Не передан обязательный параметр "type"');
  if (name === undefined) throw new ErrorWithStatusCode(400, 'Не передан обязательный параметр "name"');
  if (indicators === undefined) throw new ErrorWithStatusCode(400, 'Не передан обязательный параметр "indicators"');
  if (!METRIC_TYPES.includes(type)) throw new ErrorWithStatusCode(400, 'Параметр "type" может иметь одно из значений: ' + METRIC_TYPES.join(', '));
  if (typeof name !== 'string') throw new ErrorWithStatusCode(400, 'Параметр "name" должен быть строкой');
  if (!Array.isArray(indicators)) throw new ErrorWithStatusCode(400, 'Параметр "indicators" должен быть массивом');
  if (indicators.length > 2) throw new ErrorWithStatusCode(400, 'Метрика должна иметь не мелньше двух индикаторов');

  return (DB.transaction((type, name, indicators) => {
    const { lastInsertRowid: metricId } = DB.prepare('INSERT INTO metrics (type, name) VALUES (?, ?)').run(type, name);
    indicators.forEach(indicator => MetricIndicatorService.create(metricId, indicator.text));
    return metricId;
  }))(type, name, indicators)
};

export const update = (metricId, dataForUpdate) => {
  const keysAndValues = Object.entries(dataForUpdate);
  if (keysAndValues.length === 0) throw new ErrorWithStatusCode(400, 'Нет данных для обновления');

  const { values, setTemplates } = keysAndValues.reduce((res, [ key, value ]) => {
    res.values.push(value);
    res.setTemplates.push(`${key} = ?`);
    return res;
  } ,{ values: [], setTemplates: [] });

  values.push(metricId);

  const { changes } = DB.prepare(`UPDATE metrics SET ${setTemplates.join(', ')} WHERE id = ?`).run(values);
  if (changes === 0) throw new ErrorWithStatusCode(404, `Значения метрики для группы с id ${objectGroupId} не обновлены`);
}

export const getById = (metricId) => {
  const metric = DB.prepare('SELECT * FROM metrics WHRERE id = ?').get(metricId);
  if (!metric) throw new ErrorWithStatusCode(404, `Метрика с id ${objectsGroupId} не найдена`);
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

