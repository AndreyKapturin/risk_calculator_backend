import { DB } from "../database/index.js";

export const getUserByLogin = (login) => {
  const user = DB.prepare('SELECT * FROM users WHERE login = ?').get(login);
  return user;
}
