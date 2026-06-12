import { db } from '../db/db.js';

export const obtenerPisos = async (req, res) => {
  try {
    const [pisos] = await db.query('SELECT * FROM pisos');
    res.json(pisos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};