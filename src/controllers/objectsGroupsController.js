import * as ObjectsGroupModel from '../services/objectsGroupService.js';

export const getObjectsGroupsList = (req, res) => {
  try {
    const objectsGroups = ObjectsGroupModel.getAllForList();
    res.json(objectsGroups);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера при получении списка групп объектов' });
  }
}

export const getObjectsGroupWithMetricsById = (req, res) => {
  const objectGroupId = Number(req.params.id);

  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const objectsGroup = ObjectsGroupModel.getObjectsGroupWithMetricsById(objectGroupId);

    if (!objectsGroup) {
      res.status(404).send({ message: `Группа объектов с id ${objectGroupId} не найдена` });
      return;
    }

    res.status(200).json(objectsGroup);
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: 'Ошибка сервера при выполнении запроса' });
  }
}

export const addMetricToObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.id);
  const metric = req.body;
  
  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    ObjectsGroupModel.addMetric(objectGroupId, metric);
    res.sendStatus(201);
  } catch (error) {
    console.error('Ошибка сервера при добавлении метрики в группу объекта', error);
    res.status(500).json({ message: 'Ошибка сервера при добавлении метрики в группу объекта' })
  }
}

export const updateIndicatorsValuesForObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.id);
  const indicators = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    const isUpdated = ObjectsGroupModel.updateIndicatorsValues(objectGroupId, indicators);

    if (!isUpdated) {
      res.status(404).json({ message: `Индикаторы для группы объектов с id ${objectGroupId} не найдены`});
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка сервера при обновлении значений метрик', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении значений метрик'});
  }
}

export const deleteMetricFromObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.objectsGroupId);
  const metricId = Number(req.params.metricId);

  if (Number.isNaN(objectGroupId) || Number.isNaN(metricId)) {
    res.status(400).json({ message: 'Параметр "objectGroupId" или "metricId" имеет неверный формат или отсутствует'});
    return;
  }

  try {
    const isDeleted = ObjectsGroupModel.deleteMetric(objectGroupId, metricId);

    if (!isDeleted) {
      res.status(404).json({ message: `Нет записей в таблицах для метрики с id ${metricId} у группы с id ${objectGroupId}` });
      return;
    }
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка сервера при удалении метрики у группы объектов', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении метрики у группы объектов' });
  }
}

export const updateObjectsGroup = (req, res) => {
  const objectGroupId = Number(req.params.id);
  const dataForUpdate = req.body;

  if (Number.isNaN(objectGroupId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const isUpdated = ObjectsGroupModel.update(objectGroupId, dataForUpdate);

    if (!isUpdated) {
      res.status(404).json({ message: `Группа с id ${objectGroupId} не найдена` });
      return
    }

    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка при обновлении записи о группе объектов', error);
    res.sendStatus(500);
  }
}