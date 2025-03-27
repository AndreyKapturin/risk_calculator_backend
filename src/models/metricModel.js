import { connection } from "../database/index.js";
import { indicatorModel } from "./indicatorModel.js";

class MetricModel {
  #connection = null;
  #tableName = '';

  constructor (connection, tableName) {
    this.#connection = connection;
    this.#tableName = tableName;
  }

  async insert(columns, values) {
    const prependColumns = columns.join(', ');
    const entityTemplate = '(' + columns.map(() => '?').join(', ') + ')';
    const prependValues = values.map(() => entityTemplate).join(', ');
    values = values.flatMap(e => e);
    const query = `INSERT INTO ${this.#tableName} (${prependColumns}) VALUES ${prependValues}`;

    try {
      const [ { insertId } ] = await this.#connection.execute(query, values);
      return insertId;
    } catch (error) {
      console.log('Add indicator to BD error', error);
      throw error;  
    }
  }

  async createOne(type, name) {
    const query = `INSERT INTO ${this.#tableName} (type, name) VALUES (?, ?)`;
  
    try {
      const [ { insertId } ] = await this.#connection.execute(query, [type, name]);
      return insertId;
    } catch (error) {
      console.log('Add indicator to BD error', error);
      throw error;  
    }
  }

  async all() {
    const query = `SELECT * FROM ${this.#tableName}`;
    
    try {
      const [ metrics ] = await this.#connection.execute(query);
      return metrics;
    } catch (error) {
      console.log('Get metric from BD error', error);
      throw error;  
    }
  }


  async find(metricId) {
    const query = `SELECT * FROM ${this.#tableName} WHERE id = ?`;
    
    try {
      const [ [ metric ] ] = await this.#connection.execute(query, [metricId]);
      return metric;
    } catch (error) {
      console.log('Get metric from BD error', error);
      throw error;  
    }
  }

  async findMany(ids) {
    const query = `SELECT * FROM ${this.#tableName} WHERE id IN ?`;

    try {
      const [ [ metrics ] ] = await this.#connection.execute(query, ids);
      return metrics;
    } catch (error) {
      console.log('Find indicator error', error);
      throw error;  
    }
  }

}

export const metricModel = new MetricModel(connection, 'metrics');

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