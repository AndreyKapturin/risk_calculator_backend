import { connection } from "../database/index.js";

export const getAllForObjectGroupById = async (objectGroupId) => {
  const query = `SELECT
    metric_indicators_values.value as metricIndicatorValue,
    metric_indicators.text as metricIndicatorText,
    metrics.name as metricName,
    metrics.type as metricType
    FROM metric_indicators_values
    LEFT JOIN metric_indicators ON metric_indicators.id = metric_indicators_values.metric_indicator_id
    LEFT JOIN metrics ON metrics.id = metric_indicators.metric_id
    WHERE metric_indicators_values.object_group_id = ?`;
  const values = [objectGroupId];

   try {
      const [ result ] = await connection.execute(query, values);
      const groupedMetrics = _groupMetrics(result);
      return groupedMetrics;
    } catch (error) {
      console.log('Metrics request from BD error', error);
      throw error;
    }
}

function _groupMetrics(rowsFromBD) {
  const groupedMetrics = [];

  rowsFromBD.forEach(rowFromDB => {
    let metric = groupedMetrics.find(m => m.name === rowFromDB.metricName);

    if (!metric) {
      metric = { name: rowFromDB.metricName, type: rowFromDB.metricType, indicators: [] };
      groupedMetrics.push(metric);
    }

    metric.indicators.push({ text: rowFromDB.metricIndicatorText, value: rowFromDB.metricIndicatorValue });
  });

  return groupedMetrics;
}