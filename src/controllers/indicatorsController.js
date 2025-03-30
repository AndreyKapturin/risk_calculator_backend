import * as MetricIndicatorModel from "../services/metricIndicatorService.js";

export const updateIndicatorText = (req, res) => {
  const indicatorId = Number(req.params.id);
  const { text } = req.body;

  if (Number.isNaN(indicatorId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const isUpdated = MetricIndicatorModel.update(indicatorId, text);

    if (!isUpdated) {
      res.status(404).json({ message: `Нет записей в таблицах для индикатора с id ${indicatorId}` });
      return
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера при обновлении индикатора' });
  }
}

export const deleteIndicator = (req, res) => {
  const indicatorId = Number(req.params.id);
  
  if (Number.isNaN(indicatorId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }
  
  try {
    const isDeleted = MetricIndicatorModel.deleteIndicator(indicatorId);
    
    if (!isDeleted) {
      res.status(404).json({ message: `Нет записей в таблицах для индикатора с id ${indicatorId}` });
      return;
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера при удалении метрики' });
  }
}