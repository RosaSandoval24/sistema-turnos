import { db } from '../db/db.js';

// 🔍 OBTENER DOCTORES POR ÁREA
export const obtenerDoctoresPorArea = async (req, res) => {

  try {

    const { area_id } = req.params;

    const [doctores] = await db.query(`
      SELECT 
        u.id,
        u.username,
        d.id AS doctor_id
      FROM usuarios u
      INNER JOIN usuario_area ua 
        ON u.id = ua.usuario_id
      INNER JOIN doctores d
        ON d.usuario_id = u.id
      WHERE ua.area_id = ?
      AND u.rol = 'doctor'
    `, [area_id]);

    res.json(doctores);

  } catch (error) {

    console.error(
      'ERROR obtenerDoctoresPorArea:',
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
};