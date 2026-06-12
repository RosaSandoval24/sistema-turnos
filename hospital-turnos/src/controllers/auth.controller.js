import { db } from '../db/db.js';

export const login = async (req, res) => {

  try {

    const { username, password } = req.body;

    // 🛑 Validar datos
    if (!username || !password) {

      return res.status(400).json({
        mensaje: 'Faltan datos'
      });
    }

    // 🔍 Buscar usuario + doctor
    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.rol,
        d.id AS doctor_id,
        d.area_id
      FROM usuarios u
      LEFT JOIN doctores d
        ON d.usuario_id = u.id
      WHERE u.username = ?
      AND u.password = ?
    `, [username, password]);

    // ❌ No encontrado
    if (rows.length === 0) {

      return res.status(401).json({
        mensaje: 'Credenciales incorrectas'
      });
    }

    const usuario = rows[0];

    // ✅ Respuesta limpia
    res.json({
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      doctor_id: usuario.doctor_id,
      area_id: usuario.area_id
    });

  } catch (error) {

    console.error('ERROR LOGIN:', error);

    res.status(500).json({
      error: 'Error en el servidor'
    });
  }
};