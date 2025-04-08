import * as MetricIndicatorService from "../services/metricIndicatorService.js";

export const updateIndicatorText = (req, res) => {
  MetricIndicatorService.update(req.params.id, req.body.indicator);
  res.sendStatus(204);
}

export const deleteIndicator = (req, res) => {
  MetricIndicatorService.deleteIndicator(req.params.id);
  res.sendStatus(204);
}