import * as MetricIndicatorService from "../services/metricIndicatorService.js";

export const updateIndicatorText = (req, res) => {
  const updatedIndicator = MetricIndicatorService.updateIndicator(req.params.id, req.body.indicator);
  if (updatedIndicator) {
    res.status(201).json(updatedIndicator);
  } else {
    res.status(400).json({ message: 'Индикатор не обновлен' });
  }
}

export const deleteIndicator = (req, res) => {
  const indicatorId = req.params.id;
  const isDeleted = MetricIndicatorService.deleteIndicator(indicatorId);

  if (isDeleted) {
    res.status(200).json({ id: indicatorId });
  } else {
    res.status(400).json({ message: 'Ошибка при удалении индикатора '});
  }
}