import { useEffect, useState } from 'react';

function Recepcion({ user, cerrarSesion }) {

  const [areas, setAreas] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // 📥 cargar áreas
  useEffect(() => {

    fetch('http://192.168.1.72:3000/api/areas')
      .then(res => res.json())
      .then(data => {

        const soloTurnos = data.filter(
          a => a.tipo === 'turno'
        );

        setAreas(soloTurnos);
      });

  }, []);

  // 📢 llamar turno
  const llamarTurno = async () => {

    if (cargando) return;

    if (!areaSeleccionada) {

      setMensaje('Selecciona un área');

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
            area_id: areaSeleccionada,
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

      // ✅ mostrar mensaje real
      setMensaje(data.mensaje);

    } catch (error) {

      console.error(error);

      setMensaje('Error de conexión');

    } finally {

      setCargando(false);
    }
  };

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
            Recepción
          </h1>

          <p style={{
            marginTop: '8px',
            fontSize: '18px'
          }}>
            Bienvenido, {user.username}
          </p>

          <p style={{
            marginTop: '5px',
            fontSize: '14px',
            opacity: 0.8,
            textTransform: 'capitalize'
          }}>
            {user.rol}
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

      {/* PANEL */}
      <div style={{
        marginTop: '35px',
        display: 'flex',
        justifyContent: 'center'
      }}>

        <div style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow:
            '0 5px 15px rgba(0,0,0,0.05)'
        }}>

          <h2 style={{
            marginTop: 0,
            color: '#2f5fd0'
          }}>
            Gestión de turnos
          </h2>

          <p style={{
            color: '#666',
            marginBottom: '20px'
          }}>
            Selecciona un área para llamar
            el siguiente turno.
          </p>

          {/* SELECT */}
          <select
            value={areaSeleccionada}
            onChange={(e) =>
              setAreaSeleccionada(e.target.value)
            }
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #ccc',
              marginBottom: '20px',
              fontSize: '16px'
            }}
          >

            <option value="">
              Selecciona área
            </option>

            {areas.map(a => (

              <option
                key={a.id}
                value={a.id}
              >
                {a.nombre}
              </option>

            ))}

          </select>

          {/* BOTÓN */}
          <button
            onClick={llamarTurno}
            disabled={cargando}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderRadius: '14px',
              backgroundColor: '#28a745',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            {cargando
              ? 'Llamando...'
              : 'Llamar siguiente turno'}
          </button>

        </div>

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
            '0 5px 15px rgba(0,0,0,0.05)',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          {mensaje}
        </div>
      )}

    </div>
  );
}

export default Recepcion;