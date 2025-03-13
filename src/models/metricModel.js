import { connection } from "../database/index.js";

export const getAllForObjectGroupById = async (objectGroupId) => {
  const query = `SELECT
    metricIndicatorsValues.value as metricIndicatorValue,
    metricIndicators.text as metricIndicatorText,
    metrics.name as metricName,
    metrics.type as metricType
    FROM metricIndicatorsValues
    LEFT JOIN metricIndicators ON metricIndicators.id = metricIndicatorsValues.metricIndicatorId
    LEFT JOIN metrics ON metrics.id = metricIndicators.metricId
    WHERE metricIndicatorsValues.objectGroupId = ?`;
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