import { DB } from "../database/index.js";

export const updateIndicatorText = (req, res) => {
  const indicatorId = Number(req.params.id);
  const { text } = req.body;

  if (Number.isNaN(indicatorId)) {
    res.status(400).json({ message: 'Параметр "id" имеет неверный формат или отсутствует' });
    return;
  }

  try {
    const { changes } = DB.prepare('UPDATE metric_indicators SET text = ? WHERE id = ?').run(text, indicatorId);

    if (changes === 0) {
      res.status(404).json({ message: `Нет записей в таблицах для индикатора с id ${indicatorId}` });
      return
    }

    res.sendStatus(204);
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Ошибка сервера при обновлении индикатора' });
  }
}