import Joi from "joi";
import * as MetricIndicatorService from "../services/metricIndicatorService.js";
import { VALIDATE_ERROR_MESSAGES } from "../utils/constants.js";

const updateIndicatorTextSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  }),
  body: Joi.object({
    indicator: Joi.object({
      text: Joi.string().required().min(1)
    }).required()
  }),
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

const deleteIndicatorSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().min(1).required()
  }),
}).messages(VALIDATE_ERROR_MESSAGES).unknown(true);

export const updateIndicatorText = (req, res) => {
  const { error } = updateIndicatorTextSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const updatedIndicator = MetricIndicatorService.updateIndicator(req.params.id, req.body.indicator);
  if (updatedIndicator) {
    res.status(201).json(updatedIndicator);
  } else {
    res.status(400).json({ message: 'Индикатор не обновлен' });
  }
}

export const deleteIndicator = (req, res) => {
  const { error } = deleteIndicatorSchema.validate(req);
  if (error !== undefined) {
    res.status(400).json({ message: error.details[0].message });
    return
  }

  const indicatorId = req.params.id;
  const isDeleted = MetricIndicatorService.deleteIndicator(indicatorId);

  if (isDeleted) {
    res.status(200).json({ id: indicatorId });
  } else {
    res.status(400).json({ message: 'Ошибка при удалении индикатора '});
  }
}