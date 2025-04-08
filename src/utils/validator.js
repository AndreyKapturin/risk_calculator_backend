import { param, validationResult as checkRequestValid, body } from "express-validator";

const validate = (validateFunctions = []) => {
  return [
    ...validateFunctions,
    (req, res, next) => {
      const validationResult = checkRequestValid(req);

      if (!validationResult.isEmpty()) {
        res.status(400).send(validationResult);
      } else {
        next()
      }
    }
  ]
}

export const getObjectsGroupWithMetricsByIdSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric()
]);

export const updateObjectsGroupSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
  body('data', 'В теле запроса отсутсвтует объект "data"').isObject(),
]);

export const addMetricToObjectsGroupSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
  body('metric', 'В теле запроса отсутсвтует объект "metric"').isObject(),
]);

export const deleteMetricFromObjectsGroupSchema = validate([
  param('objectGroupId', 'В строке запроса параметр "objectGroupId" имеет неверный формат или отсутствует').isNumeric(),
  param('metricId', 'В строке запроса параметр "metricId" имеет неверный формат или отсутствует').isNumeric(),
]);

export const updateIndicatorsValuesForObjectsGroupSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
  body('indicators', 'В теле запроса отсутсвтует массив "indicators"').isArray(),
]);

export const createMetricSchema = validate([
  body('metric', 'В теле запроса отсутсвтует объект "metric"').isObject(),
]);

export const updateMetricSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
  body('data', 'В теле запроса отсутсвтует объект "data"').isObject(),
]);

export const addIndicatorToMetricSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
  body('indicator', 'В теле запроса отсутсвтует объект "indicator"').isObject(),
]);

export const deleteIndicatorSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
]);

export const updateIndicatorTextSchema = validate([
  param('id', 'В строке запроса параметр "id" имеет неверный формат или отсутствует').isNumeric(),
  body('indicator', 'В теле запроса отсутсвтует объект "indicator"').isObject(),
]);