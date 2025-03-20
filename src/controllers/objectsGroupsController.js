import { getAllForObjectGroupById } from "../models/metricModel.js";
import { getAll, getById } from "../models/objectGroupModel.js";

export const getObjectsGroupsList = async (req, res) => {
  try {
    const objectsGroups = await getAll();
    res.json(objectsGroups);
  } catch (error) {
    res.status(500).send({ error: 'Something failed!' });
  }
}

export const getObjectsGroupById = async (req, res) => {
  const objectGroupId = Number(req.params.id);

  if (Number.isNaN(objectGroupId)) {
    res.status(400).send({ error: 'Invalid of missing parameter "id"'});
    return;
  }

  try {
    const objectsGroup = await getById(objectGroupId);
    const metrics = await getAllForObjectGroupById(objectGroupId);
    objectsGroup.metrics = metrics;
    res.json({
      id: objectsGroup.id,
      name: objectsGroup.name,
      socialDamagePotencialScore: objectsGroup.social_damage_potencial_score,
      materialDamagePotencialScore: objectsGroup.material_damage_potencial_score,
      metrics
    });
  } catch (error) {
    res.status(500).send({ error: 'Something failed!' });
  }
}