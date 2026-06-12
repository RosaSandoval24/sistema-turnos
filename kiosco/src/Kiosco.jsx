import { useEffect, useState } from 'react';

function Kiosco() {
  const [areas, setAreas] = useState([]);
  const [turno, setTurno] = useState(null);
  const [visible, setVisible] = useState(false);
  const audio = new Audio('/ding.mp3');

useEffect(() => {
  fetch('http://192.168.1.72:3000/api/areas')
    .then(res => res.json())
    .then(data => {
      setAreas(data);
    })
    .catch(err => console.error(err));
}, []);

  const generarTurno = async (area) => {
    try {
      const res = await fetch('http://192.168.1.72:3000/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_id: area.id })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.mensaje || 'Error');
        return;
      }

      setTurno({
        codigo: data.codigo,
        area: area.nombre
      });
  
      setVisible(true);
      // sonido
      audio.currentTime = 0;
      audio.play();

      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setTurno(null), 300);
      }, 4000);

    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  //  Agrupar por piso
  const pisos = {};
  areas
    .filter(a => a.tipo === 'turno')
    .forEach(area => {
      const piso = area.piso_id || 1;
      if (!pisos[piso]) pisos[piso] = [];
      pisos[piso].push(area);
    });

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f0f6ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center', 
      fontFamily: 'Arial'
    }}>

      {/* CONTENEDOR CENTRAL */}
      <div style={{ textAlign: 'center' }}>

        <h1 style={{ color: '#1e3a8a' }}>
          Centro Estatal de Cancerologia Durango 
        </h1>

        <p style={{ marginBottom: '30px' }}>
          Seleccione un servicio
        </p>

        {/*  PISOS */}
        {Object.keys(pisos).map(piso => (
          <div key={piso} style={{ marginBottom: '30px' }}>

            <h2 style={{
              color: '#1e40af',
              marginBottom: '15px'
            }}>
              Piso {piso}
            </h2>

            <div style={{
              display: 'flex',
              justifyContent: 'center', 
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              {pisos[piso].map(area => (
                <button
                  key={area.id}
                  onClick={() => generarTurno(area)}
                  style={{
                    width: '220px',
                    padding: '25px',
                    fontSize: '18px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {area.nombre}
                </button>
              ))}
            </div>

          </div>
        ))}

      </div>

      {/*  OVERLAY + TURNO */}
      {turno && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 10
          }} />

          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.9})`,
            opacity: visible ? 1 : 0,
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
            padding: '30px 60px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            zIndex: 20
          }}>
            <p style={{ margin: 0 }}>Turno generado</p>

            <h1 style={{
              fontSize: '60px',
              color: '#2563eb',
              margin: '10px 0'
            }}>
              {turno.codigo}
            </h1>

            <p style={{ margin: 0 }}>{turno.area}</p>
          </div>
        </>
      )}

    </div>
  );
}

export default Kiosco;