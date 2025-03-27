export class Model {
  #database = null;
  #tableName = null;

  constructor (database, tableName) {
    this.#database = database;
    this.#tableName = table;
  }

  findOne() {
    const query = `SELECT * FROM ${this.#tableName} WHERE`;
  }

}