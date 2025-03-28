import path from 'path';
import Database from "better-sqlite3";
const pathToDB = path.resolve('src', 'database', 'risk_calculator.sqlite');
export const DB = new Database(pathToDB);