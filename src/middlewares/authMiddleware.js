import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../utils/constants.js';

export const checkToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Вы не авторизованы' });
  }
}
