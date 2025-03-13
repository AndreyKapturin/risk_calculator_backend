import { getAllForObjectGroupById } from "../models/metricModel.js";

export const getMetricsForObjectGroupById = async (req, res) => {
  const objectGroupId = Number(req.params.id);
  
  try {
    const metrics = await getAllForObjectGroupById(objectGroupId);
    res.json(metrics);
  } catch (error) {
    res.status(500).send({ error: 'Something failed!' });
  }
}
