import { getAll } from "../models/objectGroupModel.js";

export const getAllObjectsGroups = async (req, res) => {
  try {
    const objectsGroups = await getAll();
    res.json(objectsGroups);
  } catch (error) {
    res.status(500).send({ error: 'Something failed!' });
  }
}