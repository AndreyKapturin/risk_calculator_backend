import { getAllForObjectGroupById } from "../models/metricModel.js";

export const getMetricsForObjectGroupById = async (req, res) => {
  const objectGroupId = Number(req.params.id);

  if (Number.isNaN(objectGroupId)) {
    res.status(400).send({ error: 'Invalid of missing parameter "id"'});
    return;
  }
  
  try {
    const metrics = await getAllForObjectGroupById(objectGroupId);
    res.json(metrics);
  } catch (error) {
    res.status(500).send({ error: 'Something failed!' });
  }
}
