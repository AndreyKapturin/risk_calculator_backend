import { connection } from '../database/index.js';

export const getAll = async () => {
  try {
    const [ result ] = await connection.query('SELECT * FROM objectsGroups');
    return result;
  } catch (error) {
    console.log('Object groups request from BD error', error);
    throw error;
  }
};
