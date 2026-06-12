import { db } from '../db/db.js';

// 🔹 Crear turno
export const crearTurno = async (req, res) => {
  try {
    const { area_id } = req.body;

    if (!area_id) {
      return res.status(400).json({ mensaje: 'Área requerida' });
    }

    const [area] = await db.query(
      'SELECT codigo FROM areas WHERE id = ?',
      [area_id]
    );

    if (area.length === 0) {
      return res.status(404).json({ mensaje: 'Área no encontrada' });
    }

    let codigoArea = area[0].codigo || 'T';

    const [rows] = await db.query(
      'SELECT COUNT(*) as total FROM turnos WHERE fecha = CURDATE() AND area_id = ?',
      [area_id]
    );

    const numero = rows[0].total + 1;

    const codigo = `${codigoArea}-${String(numero).padStart(3, '0')}`;

    await db.query(
      'INSERT INTO turnos (codigo, area_id, fecha) VALUES (?, ?, CURDATE())',
      [codigo, area_id]
    );

    res.json({
      mensaje: 'Turno creado',
      codigo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Llamar turno
export const llamarTurno = async (req, res) => {
  try {
    const { area_id } = req.body;

    const [turnos] = await db.query(`
      SELECT * FROM turnos 
      WHERE area_id = ?
      AND fecha = CURDATE()
      AND id NOT IN (SELECT turno_id FROM llamados)
      ORDER BY id ASC
      LIMIT 1
    `, [area_id]);

    if (turnos.length === 0) {
      return res.json({ mensaje: 'No hay turnos pendientes' });
    }

    const turno = turnos[0];

    await db.query(
      `INSERT INTO llamados (turno_id, area_id, mensaje, fecha)
       VALUES (?, ?, ?, NOW())`,
      [turno.id, area_id, `Turno ${turno.codigo}`]
    );

    await db.query(
      `INSERT INTO atenciones (tipo, area_id, turno_id, fecha, hora_atencion)
       VALUES ('turno', ?, ?, CURDATE(), NOW())`,
      [area_id, turno.id]
    );

    res.json({
      mensaje: 'Turno llamado',
      turno: turno.codigo
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Atención cita
export const registrarAtencionCita = async (req, res) => {
  try {
    const { area_id, doctor_id } = req.body;

    await db.query(
      `INSERT INTO atenciones (tipo, area_id, doctor_id, fecha, hora_atencion)
       VALUES ('cita', ?, ?, CURDATE(), NOW())`,
      [area_id, doctor_id]
    );

    res.json({ mensaje: 'Atención registrada' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};