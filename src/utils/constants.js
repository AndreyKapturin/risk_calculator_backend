export const VALIDATE_ERROR_MESSAGES = {
  'number.base': 'Параметр {#key} по пути {#label} должен быть числом',
  'number.min': 'Параметр {#key} по пути {#label} должен быть больше 0',
  'string.base': 'Параметр {#key} по пути {#label} должен быть строкой',
  'string.empty': 'Параметр {#key} по пути {#label} не может быть пустой строкой',
  'object.unknown': 'Передан неизветсный параметр {#key} по пути {#label}',
  'object.min': 'Параметр {#key} не должен быть пустым',
  'object.base': 'Параметр {#key} по пути {#label} должен быть объектом',
  'array.min': 'Массив {#key} должен содержать не меньше {#limit} элементов',
  'array.base': 'Параметр {#key} по пути {#label} должен быть массивом',
  'any.required': 'Параметр {#key} по пути {#label} отсутствует',
  'any.only': 'Параметр {#key} может принимать значения {#valids}'
};
export const METRIC_TYPES = ['risk indicator', 'good faith criteria'];
export const SECRET_KEY = process.env.SECRET_KEY;
export const ACCESS_TOKEN_LIFETIME_IN_SECOND = Number(process.env.ACCESS_TOKEN_LIFETIME_IN_SECOND);