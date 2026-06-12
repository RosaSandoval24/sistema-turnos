import { db } from '../db/db.js';


// 🔍 OBTENER LLAMADOS (para pantalla)
export const obtenerLlamados = async (req, res) => {

  try {

    const [llamados] = await db.query(`
      SELECT 
        l.*, 
        t.codigo, 
        a.nombre AS area, 
        a.tipo,
        d.nombre AS doctor
      FROM llamados l
      LEFT JOIN turnos t ON l.turno_id = t.id
      LEFT JOIN areas a ON l.area_id = a.id
      LEFT JOIN doctores d ON l.doctor_id = d.id
      ORDER BY l.id DESC
      LIMIT 5
    `);

    res.json(llamados);

  } catch (error) {

    console.error('ERROR obtenerLlamados:', error);

    res.status(500).json({
      error: error.message
    });
  }
};


// 📢 LLAMAR SIGUIENTE
export const llamarSiguiente = async (req, res) => {

  const connection = await db.getConnection();

  try {

    const {
      area_id,
      usuario_id,
      doctor_id: doctorSeleccionado,
      nombre_paciente
    } = req.body;

    let doctor_id = null;

    // 🛑 validar usuario
    if (!usuario_id) {

      return res.status(400).json({
        mensaje: 'Usuario requerido'
      });
    }

    await connection.beginTransaction();

    // 👤 obtener usuario
    const [usuarios] = await connection.query(
      `SELECT * FROM usuarios WHERE id = ?`,
      [usuario_id]
    );

    if (usuarios.length === 0) {

      await connection.rollback();

      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    const usuario = usuarios[0];

    let area_id_final = area_id;

    // 👨‍⚕️ doctor toma su área automáticamente
    if (usuario.rol === 'doctor') {

      const [relacion] = await connection.query(
        `SELECT area_id
         FROM usuario_area
         WHERE usuario_id = ?
         LIMIT 1`,
        [usuario_id]
      );

      if (relacion.length === 0) {

        await connection.rollback();

        return res.status(403).json({
          mensaje: 'Doctor sin área asignada'
        });
      }

      area_id_final = relacion[0].area_id;

      doctor_id = usuario.doctor_id;
    }

    // 🛠️ admin puede seleccionar doctor
    if (usuario.rol === 'admin') {

      doctor_id = Number(doctorSeleccionado);
    }

    // 🔍 obtener área
    const [areas] = await connection.query(
      `SELECT * FROM areas WHERE id = ?`,
      [area_id_final]
    );

    if (areas.length === 0) {

      await connection.rollback();

      return res.status(404).json({
        mensaje: 'Área no encontrada'
      });
    }

    const area = areas[0];

    // 🧾 recepción solo puede llamar turnos
    if (
      usuario.rol === 'recepcion' &&
      area.tipo !== 'turno'
    ) {

      await connection.rollback();

      return res.status(403).json({
        mensaje: 'Recepción solo puede llamar turnos'
      });
    }

    // 🩺 CITAS
    if (area.tipo === 'cita') {

      console.log('DOCTOR ID:', doctor_id);

      const [doctorData] = await connection.query(
        `SELECT nombre FROM doctores WHERE id = ?`,
        [doctor_id]
      );

      const nombreDoctor =
        doctorData[0]?.nombre || 'Doctor';
        // 💾 guardar paciente temporal
        console.log('PACIENTE:', nombre_paciente);
        if (nombre_paciente) {

          await connection.query(
            `INSERT INTO pacientes_llamados
            (nombre_paciente, area_id, doctor_id)
            VALUES (?, ?, ?)`,
            [
              nombre_paciente,
              area_id_final,
              doctor_id
            ]
          );
        }

      // 💾 guardar llamado
      await connection.query(
        `INSERT INTO llamados
        (
          turno_id,
          area_id,
          doctor_id,
          mensaje,
          nombre_paciente,
          fecha
        )
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          null,
          area_id_final,
          doctor_id,
          `Paciente con ${nombreDoctor}`,
          nombre_paciente
        ]
      );

      await connection.commit();

      return res.json({
        mensaje: 'Paciente llamado correctamente'
      });
    }

    // 🎫 TURNOS
    if (area.tipo === 'turno') {

      // 🔒 bloqueo anti doble click
      const [turnos] = await connection.query(
        `SELECT *
         FROM turnos
         WHERE area_id = ?
         AND estado = 'pendiente'
         ORDER BY id ASC
         LIMIT 1
         FOR UPDATE`,
        [area_id_final]
      );

      if (turnos.length === 0) {

        await connection.rollback();

        return res.json({
          mensaje: 'No hay turnos pendientes'
        });
      }

      const turno = turnos[0];

      // 🔄 cambiar estado
      await connection.query(
        `UPDATE turnos
         SET estado = 'llamado'
         WHERE id = ?`,
        [turno.id]
      );

      // 💾 guardar llamado
      await connection.query(
        `INSERT INTO llamados
        (turno_id, area_id, doctor_id, mensaje, fecha)
        VALUES (?, ?, ?, ?, NOW())`,
        [
          turno.id,
          area_id_final,
          doctor_id || null,
          `Turno ${turno.codigo}`
        ]
      );

      await connection.commit();

      return res.json({
        mensaje: 'Turno llamado correctamente',
        turno
      });
    }

    await connection.rollback();

    return res.status(400).json({
      mensaje: 'Tipo de área inválido'
    });

  } catch (error) {

    await connection.rollback();

    console.error(
      'ERROR llamarSiguiente:',
      error
    );

    res.status(500).json({
      error: error.message
    });

  } finally {

    connection.release();
  }
};