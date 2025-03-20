import { connection } from '../database/index.js';

export const getAll = async () => {
  try {
    const [ result ] = await connection.query('SELECT * FROM objects_groups');
    return result;
  } catch (error) {
    console.log('Object groups request from BD error', error);
    throw error;
  }
};

export const getById = async (objectGroupId) => {
  try {
    const query = 'SELECT * FROM objects_groups WHERE id = ? LIMIT 1';
    const [ [ result ] ] = await connection.execute(query, [objectGroupId]);
    return result;
  } catch (error) {
    console.log('Object groups request from BD error', error);
    throw error;
  }
};
