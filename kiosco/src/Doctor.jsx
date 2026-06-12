import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatearFecha = (fecha) => {

  const f = new Date(fecha);

  return f.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

//  PDF
const generarPDF = async () => {

  try {

    const res = await fetch(
      'http://192.168.1.72:3000/api/reporte'
    );

    const data = await res.json();

    console.log(data);

    const doc = new jsPDF();

    let y = 20;

    // TÍTULO
doc.setFontSize(14);

doc.text(
  'CENTRO ESTATAL DE CANCEROLOGÍA DE DURANGO',
  105,
  y,
  { align: 'center' }
);

y += 10;

doc.setFontSize(20);

doc.text(
  'REPORTE SEMANAL',
  105,
  y,
  { align: 'center' }
);

y += 15;

// PERIODO Y FECHA
doc.setFontSize(11);

doc.text(
  `Periodo del reporte: Últimos 7 días`,
  105,
  y,
  { align: 'center' }
);

y += 6;

doc.text(
  `Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`,
  105,
  y,
  { align: 'center' }
);

y += 15;

// RESUMEN GENERAL
doc.setFontSize(14);

doc.text(
  'RESUMEN GENERAL',
  20,
  y
);

y += 8;

autoTable(doc, {
  startY: y,
  margin: { left: 20, right: 20 },
tableWidth: 'auto',
  head: [['Indicador', 'Valor']],
  body: [
  ['Turnos generados', data.resumen.totalTurnos],
  ['Turnos atendidos', data.resumen.turnosAtendidos],
  ['Citas médicas', data.resumen.citasAtendidas],
  ['Pendientes', data.resumen.pendientes],
  ['Total atenciones', data.resumen.totalAtenciones],
  ['Espera promedio (min)', data.tiempoPromedioGeneral]
]
});

y = doc.lastAutoTable.finalY + 15;

   // TURNOS

    doc.setFontSize(14);

    doc.text(
      'DETALLE DE TURNOS POR AREA',
      20,
      y
    );

    y += 10;

    const filasTurnos = Object.keys(data.detalleTurnos).map(area => {

  const d = data.detalleTurnos[area];

  return [
    area,
    d.generados,
    d.atendidos,
    d.pendientes,
    data.tiempoPromedioArea?.[area] || 0
  ];

});

autoTable(doc, {
  startY: y,
  margin: { left: 20, right: 20 },
tableWidth: 'auto',
  head: [[
  'Área',
  'Generados',
  'Atendidos',
  'Pendientes',
  'Espera Prom. (min)'
]],
  body: filasTurnos
});

y = doc.lastAutoTable.finalY + 15;
    
// PACIENTES DE CITAS

doc.setFontSize(14);

doc.text(
  'PACIENTES ATENDIDOS EN CITAS',
  20,
  y
);

y += 10;

const filasCitas = [];

Object.keys(data.detalleCitas).forEach(area => {

  data.detalleCitas[area].forEach(c => {

    filasCitas.push([
      area,
      c.paciente,
      c.doctor,
      formatearFecha(c.fecha)
    ]);

  });

});

autoTable(doc, {
  startY: y,
  margin: { left: 20, right: 20 },
tableWidth: 'auto',
  head: [[
    'Área',
    'Paciente',
    'Doctor',
    'Fecha'
  ]],
  body: filasCitas
});

y = doc.lastAutoTable.finalY + 15;

    // ESTADÍSTICAS POR DOCTOR

    doc.setFontSize(14);

    doc.text(
      'ESTADISTICAS POR DOCTOR',
      20,
      y
    );

    y += 10;

    const filasDoctor = Object.keys(
  data.estadisticasDoctor
).map(doctor => [

  doctor,
  data.estadisticasDoctor[doctor]

]);

autoTable(doc, {
  startY: y,
  margin: { left: 20, right: 20 },
tableWidth: 'auto',
  head: [[
    'Doctor',
    'Pacientes Atendidos'
  ]],
  body: filasDoctor
});

y = doc.lastAutoTable.finalY + 15;

    // GUARDAR
    doc.save('Reporte_semanal.pdf');

  } catch (error) {

    console.error(error);

    alert('Error al generar reporte');
  }
};

function Doctor({ user, cerrarSesion }) {

  const [areas, setAreas] = useState([]);
  const [areaCita, setAreaCita] = useState('');
  const [doctores, setDoctores] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [nombrePaciente, setNombrePaciente] = useState('');

  const [areaTurno, setAreaTurno] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [pacienteActual, setPacienteActual] = useState('');
  const [cargando, setCargando] = useState(false);

  //  cargar áreas
  useEffect(() => {

    fetch('http://192.168.1.72:3000/api/areas')
      .then(res => res.json())
      .then(data => {

        setAreas(data);

        //  doctor area automáticamente
        if (user.rol === 'doctor') {

          const areaDoctor = data.find(
            a => a.id === user.area_id
          );

          if (areaDoctor) {
            setAreaCita(areaDoctor.id);
          }
        }

      })
      .catch(err => console.error(err));

  }, []);

  //  cargar doctores
  useEffect(() => {

    if (!areaCita) return;

    fetch(
      `http://192.168.1.72:3000/api/usuarios/por-area/${areaCita}`
    )
      .then(res => res.json())
      .then(data => {

        setDoctores(data);
      })
      .catch(err => console.error(err));

  }, [areaCita]);

  //  LLAMAR CITA
  const llamarCita = async () => {

    if (cargando) return;

    if (!areaCita) {

      setMensaje('Selecciona área');

      return;
    }

    setCargando(true);

    setMensaje('Llamando...');

    try {

      const res = await fetch(
        'http://192.168.1.72:3000/api/llamar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            area_id: areaCita,
            usuario_id: user.id,

            doctor_id: (
             user.rol === 'doctor'
             ? user.doctor_id
             : doctorSeleccionado
          ),

          nombre_paciente: nombrePaciente
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setMensaje(
          data.mensaje || 'Error'
        );

        return;
      }

      setMensaje(data.mensaje);
      setPacienteActual(nombrePaciente);

    } catch (error) {

      console.error(error);

      setMensaje('Error de conexión');

    } finally {

      setCargando(false);
    }
  };

  //  LLAMAR TURNO
  const llamarTurno = async () => {

    if (cargando) return;

    if (!areaTurno) {

      setMensaje('Selecciona área');

      return;
    }

    setCargando(true);

    try {

      const res = await fetch(
        'http://192.168.1.72:3000/api/llamar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            area_id: areaTurno,
            usuario_id: user.id
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setMensaje(
          data.mensaje || 'Error'
        );

        return;
      }

      setMensaje(data.mensaje);

    } catch (error) {

      console.error(error);

      setMensaje('Error de conexión');

    } finally {

      setCargando(false);
    }
  };

  const citas = areas.filter(
    a => a.tipo === 'cita'
  );

  const turnos = areas.filter(
    a => a.tipo === 'turno'
  );

  return (

    <div style={{
      minHeight: '100vh',
      background: '#f4f7fb',
      fontFamily: 'Arial',
      padding: '30px'
    }}>

      {/* HEADER */}
      <div style={{
        background:
          'linear-gradient(90deg, #2f5fd0, #4f7df0)',
        borderRadius: '20px',
        padding: '25px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow:
          '0 5px 15px rgba(0,0,0,0.1)'
      }}>

        <div>

          <h1 style={{
            margin: 0,
            fontSize: '36px'
          }}>
            Sistema integral de espera 
          </h1>

          <p style={{
            marginTop: '8px',
            fontSize: '18px'
          }}>
            Bienvenido, {user.username}
          </p>

        </div>

        <button
          onClick={cerrarSesion}
          style={{
            backgroundColor: 'white',
            color: '#2f5fd0',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Cerrar sesión
        </button>

      </div>

      {/* CONTENIDO */}
      <div style={{
        marginTop: '30px',
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '25px'
      }}>

{/*  DOCTOR */}
{user.rol === 'doctor' && (

<div style={{
  backgroundColor: 'white',
  borderRadius: '18px',
  padding: '24px',
  boxShadow:
    '0 4px 12px rgba(0,0,0,0.05)',
  maxWidth: '520px',
  margin: '0 auto'
}}>


    {/*  MOSTRAR ÁREA */}
<div style={{
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: '#f4f7fb',
  padding: '14px',
  borderRadius: '12px',
  marginBottom: '18px',
  fontWeight: 'bold',
  fontSize: '18px',
  color: '#2f5fd0',
  textAlign: 'left'
}}>
      {
        areas.find(
          a => a.id === Number(areaCita)
        )?.nombre || 'Área'
      }
    </div>

<input
  type="text"
  placeholder="Nombre del paciente"
  value={nombrePaciente}
  onChange={(e) =>
    setNombrePaciente(e.target.value)
  }
  style={{
  width: '100%',
  boxSizing: 'border-box',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #ccc',
  marginBottom: '15px',
  fontSize: '16px'
}}
/>

<button
  onClick={llamarCita}
  disabled={cargando}
  style={{
    width: '100%',
    padding: '15px',
    border: 'none',
    borderRadius: '14px',
    backgroundColor: '#2f5fd0',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '18px',
    cursor: 'pointer'
  }}
>
      {cargando
        ? 'Llamando...'
        : 'Llamar siguiente paciente'}
    </button>

  </div>
)}

        {/*  ADMIN */}
        {user.rol === 'admin' && (

          <>
            {/* CITAS */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow:
                '0 5px 15px rgba(0,0,0,0.05)'
            }}>

              <h2 style={{
                marginTop: 0,
                color: '#2f5fd0'
              }}>
                Consulta (Citas)
              </h2>

              <select
                value={areaCita}
                onChange={(e) =>
                  setAreaCita(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  marginBottom: '15px'
                }}
              >

                <option value="">
                  Selecciona área
                </option>

                {citas.map(a => (

                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.nombre}
                  </option>

                ))}

              </select>

              <select
                value={doctorSeleccionado || ''}
                onChange={(e) => {

                  setDoctorSeleccionado(
                    e.target.value
                      ? Number(e.target.value)
                      : null
                  );
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  marginBottom: '15px'
                }}
              >
            
                <option value="">
                  Selecciona doctor
                </option>

                {doctores.map(doc => (

                  <option
                    key={doc.id}
                    value={doc.doctor_id || doc.id}
                  >
                    {doc.username}
                  </option>

                ))}

              </select>

              <input
                type="text"
                placeholder="Nombre del paciente"
                value={nombrePaciente}
                onChange={(e) =>
                  setNombrePaciente(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  marginBottom: '15px',
                  fontSize: '16px'
                }}
              />

              <button
                onClick={llamarCita}
                disabled={cargando}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#2f5fd0',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                {cargando
                  ? 'Llamando...'
                  : 'Llamar paciente'}
              </button>

            </div>

            {/* TURNOS */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '25px',
              boxShadow:
                '0 5px 15px rgba(0,0,0,0.05)'
            }}>

              <h2 style={{
                marginTop: 0,
                color: '#2f5fd0'
              }}>
                Turnos
              </h2>

              <select
                value={areaTurno}
                onChange={(e) =>
                  setAreaTurno(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  marginBottom: '15px'
                }}
              >

                <option value="">
                  Selecciona área
                </option>

                {turnos.map(a => (

                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.nombre}
                  </option>

                ))}

              </select>

              <button
                onClick={llamarTurno}
                disabled={cargando}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginBottom: '15px'
                }}
              >
                {cargando
                  ? 'Llamando...'
                  : 'Llamar turno'}
              </button>

              <button
                onClick={generarPDF}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Generar reporte
              </button>

            </div>
          </>
        )}

      </div>

      {/* MENSAJE */}
      {mensaje && (

        <div style={{
          marginTop: '30px',
          backgroundColor: '#ffffff',
          padding: '18px',
          borderRadius: '15px',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#2f5fd0',
          boxShadow:
            '0 5px 15px rgba(0,0,0,0.05)'
        }}>
          {mensaje}
        </div>
      )}

    </div>
  );
}

export default Doctor;