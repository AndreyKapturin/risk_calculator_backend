import Joi from "joi";
import { ACCESS_TOKEN_LIFETIME_IN_SECOND, SECRET_KEY, VALIDATE_ERROR_MESSAGES } from "../utils/constants.js";
import * as UserService from '../services/userService.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const loginSchema = Joi.object({
  body: Joi.object({
    user: Joi.object({
      login: Joi.string().required().min(1),
      password: Joi.string().required().min(1)
    }).required()
  }),
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

export const authenticate = (req, res) => {
  const { error } = loginSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const { login, password } = req.body.user;
  const user = UserService.getUserByLogin(login);
  const isValidPassword = bcrypt.compareSync(password, user?.password ?? '');
  if (!user || !isValidPassword) {
    res.status(400).json({ message: 'Неверный логин или пароль' });
    return
  }

  const payload = { id: user.id };
  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: ACCESS_TOKEN_LIFETIME_IN_SECOND });
  res.status(200).json({ accessToken });
}
