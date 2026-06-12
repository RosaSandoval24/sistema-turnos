import { db } from '../db/db.js';

export const obtenerAreas = async (req, res) => {
  try {
    const [areas] = await db.query('SELECT * FROM areas');
    res.json(areas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};