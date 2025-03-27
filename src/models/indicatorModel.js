import { connection } from "../database/index.js";

class IndicatorModel {
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

  async createOne (metricId, text) {
    const query = `INSERT INTO ${this.#tableName} (metric_id, text) VALUES (?, ?)`;
  
    try {
      const [ { insertId: indicatorId } ] = await this.#connection.execute(query, [metricId, text]);
      return indicatorId;
    } catch (error) {
      console.log('Add indicator to BD error', error);
      throw error;  
    }
  }

  async createMany (metricId, indicators) {
    const query = `INSERT INTO ${this.#tableName} (metric_id, text) VALUES ${indicators.map(i => '(?, ?)').join(', ')}`;
  
    try {
      await this.#connection.execute(query, indicators.flatMap(i => [metricId, i]));
    } catch (error) {
      console.log('Add many indicators to BD error', error);
      throw error;  
    }
  }

  async select(columns, where) {
    const prependColumns = columns.join(', ');

    let query = `SELECT ${prependColumns} FROM ${this.#tableName}`;

    if (where) {
      
      query += ` ${where}`;
    }

    try {
      const [ indicators ] = await this.#connection.execute(query);
      return indicators;
    } catch (error) {
      console.log('Find indicator error', error);
      throw error;  
    }
  }

  async all() {
    const query = `SELECT * FROM ${this.#tableName}`;

    try {
      const [ indicators ] = await this.#connection.execute(query);
      return indicators;
    } catch (error) {
      console.log('Find indicator error', error);
      throw error;  
    }
  }

  async find(indicatorId) {
    const query = `SELECT * FROM ${this.#tableName} WHERE id = ?`;

    try {
      const [[ indicator ]] = await this.#connection.execute(query, [indicatorId]);
      return indicator;
    } catch (error) {
      console.log('Find indicator error', error);
      throw error;  
    }
  }

  async findMany(ids) {
    const query = `SELECT * FROM ${this.#tableName} WHERE id IN ?`;

    try {
      const [[ indicators ]] = await this.#connection.execute(query, ids);
      return indicators;
    } catch (error) {
      console.log('Find indicator error', error);
      throw error;  
    }
  }

  async findIndicatorsForMetricById (metricId) {
    const query = `SELECT * FROM ${this.#tableName} WHERE metric_id = ?`;
    const [ indicators ] = await this.#connection.execute(query, [metricId]);
    return indicators;
  }

  async update (indicatorId, text) {
    const query = `UPDATE ${this.#tableName} SET text = ? WHERE id = ?`;
    
    try {
      await this.#connection.execute(query, [text, indicatorId]);
    } catch (error) {
      console.log('Update indicator error', error);
      throw error;  
    }
  }

  async deleteIndicator (indicatorId) {
    const query = `DELETE FROM ${this.#tableName} WHERE id = ?`;
  
    try {
      await this.#connection.execute(query, [indicatorId]);
    } catch (error) {
      console.log('Delete indicator from BD error', error);
      throw error;  
    }
  }

}

export const indicatorModel = new IndicatorModel(connection, 'metric_indicators');