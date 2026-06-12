import { db } from '../db/db.js';

export const generarReporteSemanal = async (req, res) => {
  try {

    // últimos 7 días
    const [rows] = await db.query(`
      SELECT 
        l.*,
        t.created_at AS turno_creado,
        a.nombre AS area,
        d.nombre AS doctor
      FROM llamados l
      LEFT JOIN turnos t ON l.turno_id = t.id
      JOIN areas a ON l.area_id = a.id
      LEFT JOIN doctores d ON l.doctor_id = d.id
      WHERE l.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY a.nombre ASC
    `);

    let totalTurnos = 0;
    let turnosAtendidos = 0;
    let citasAtendidas = 0;
    let pendientes = 0;

    // detalle separado
    const detalleTurnos = {};
    const detalleCitas = {};
    const estadisticasDoctor = {};

    // tiempos de espera
    const tiemposArea = {};
    let sumaTiempoGeneral = 0;
    let totalTiempos = 0;

    rows.forEach(r => {

      const esTurno = r.turno_id !== null;
      const esCita = r.doctor_id !== null;

      // =========================
      // TURNOS
      // =========================
      if (esTurno) {

        totalTurnos++;

        // calcular tiempo de espera
        if (r.turno_creado && r.fecha) {

          const inicio = new Date(r.turno_creado);
          const fin = new Date(r.fecha);

          const minutos = Math.round(
            (fin - inicio) / (1000 * 60)
          );

          console.log(
          r.area,
          r.turno_creado,
          r.fecha,
          minutos
        );

          if (!tiemposArea[r.area]) {
            tiemposArea[r.area] = {
              totalMinutos: 0,
              cantidad: 0
            };
          }

          tiemposArea[r.area].totalMinutos += minutos;
          tiemposArea[r.area].cantidad++;

          sumaTiempoGeneral += minutos;
          totalTiempos++;
        }

        if (!detalleTurnos[r.area]) {
          detalleTurnos[r.area] = {
            generados: 0,
            atendidos: 0,
            pendientes: 0
          };
        }

        detalleTurnos[r.area].generados++;

        if (r.mensaje) {

          turnosAtendidos++;
          detalleTurnos[r.area].atendidos++;

        } else {

          pendientes++;
          detalleTurnos[r.area].pendientes++;
        }
      }

      // =========================
      // 🟩 CITAS
      // =========================
      if (esCita) {

        citasAtendidas++;

        // 📊 estadística por doctor
        if (!estadisticasDoctor[r.doctor]) {
          estadisticasDoctor[r.doctor] = 0;
        }

        estadisticasDoctor[r.doctor]++;

        if (!detalleCitas[r.area]) {
          detalleCitas[r.area] = [];
        }

        detalleCitas[r.area].push({
          paciente: r.nombre_paciente || 'Sin nombre',
          doctor: r.doctor || 'Sin doctor',
          fecha: r.fecha
        });
      }

    });

const tiempoPromedioArea = {};

Object.keys(tiemposArea).forEach(area => {

  tiempoPromedioArea[area] = Math.round(
    tiemposArea[area].totalMinutos /
    tiemposArea[area].cantidad
  );

});

const tiempoPromedioGeneral =
  totalTiempos > 0
    ? Math.round(
        sumaTiempoGeneral / totalTiempos
      )
    : 0;

    res.json({

      resumen: {
        totalTurnos,
        turnosAtendidos,
        citasAtendidas,
        pendientes,
        totalAtenciones:
          turnosAtendidos + citasAtendidas
      },

      detalleTurnos,
      detalleCitas,
      estadisticasDoctor,
      tiempoPromedioArea,
      tiempoPromedioGeneral

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al generar reporte'
    });
  }
};