import { useEffect, useState, useRef } from 'react';

function App() {
  const [llamados, setLlamados] = useState([]);
  const [animar, setAnimar] = useState(false);
  const [fechaHora, setFechaHora] = useState(new Date());
  const ultimoCodigo = useRef(null);
  const audioRef = useRef(null);
  const imagenes = [
    '/galeria/foto1.jpg',
    '/galeria/foto2.jpg',
    '/galeria/foto3.jpg',
    '/galeria/foto4.jpg'
  ];

const [imagenActual, setImagenActual] = useState(0);

useEffect(() => {
  const audio = new Audio('/ding.mp3');
  audio.volume = 0.5;

  const activarAudio = () => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = audio;
      console.log('Audio activado');
    }).catch(err => console.log('Bloqueado:', err));
  };

  window.addEventListener('click', activarAudio, { once: true });

}, []);

useEffect(() => {

  const timer = setInterval(() => {
    setFechaHora(new Date());
  }, 1000);

  return () => clearInterval(timer);

}, []);

useEffect(() => {

  const intervalo = setInterval(() => {

    setImagenActual(prev =>
      (prev + 1) % imagenes.length
    );

  }, 5000);

  return () => clearInterval(intervalo);

}, []);

  useEffect(() => {
    const obtener = () => {
      fetch('http://192.168.1.72:3000/api/llamados')
        .then(res => res.json())
        .then(data => {
        console.log(data);
        setLlamados(data);
      })
        .catch(err => console.error(err));
    };

    obtener();
    const interval = setInterval(obtener, 3000);

    return () => clearInterval(interval);
  }, []);

  const actual = llamados[0];
  const historial = llamados.slice(1, 6);

  // 🔥 ANIMACIÓN + DING
useEffect(() => {

  if (actual && actual.id !== ultimoCodigo.current) {

    // 🎬 animación
    setAnimar(true);

    setTimeout(() => {
      setAnimar(false);
    }, 500);

    // 🔊 sonido
    if (audioRef.current) {

      audioRef.current.currentTime = 0;

      audioRef.current.play()
        .catch(err => console.log(err));
    }

    // ✅ guardar último llamado
    ultimoCodigo.current = actual.id;
  }

}, [actual]);

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f5f7fb',
      fontFamily: 'Arial',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* HEADER */}
      <div style={{
        backgroundColor: '#2f5fd0',
        color: 'white',
        textAlign: 'center',
        padding: '15px',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Siguiente turno
      </div>

      {/* CONTENIDO */}
      <div style={{
        display: 'flex',
        flex: 1
      }}>

        {/* IZQUIERDA */}
        <div style={{
          flex: 1.7,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>

          <h2 style={{ color: '#2f5fd0' }}>
            {actual?.area || ''}
          </h2>

      <div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: '250px'
}}>

  <h1 style={{
    fontSize: actual?.tipo === 'cita' ? '70px' : '110px',
    margin: '20px 0',
    transform: animar ? 'scale(1.1)' : 'scale(1)',
    opacity: animar ? 0.7 : 1,
    transition: 'all 0.3s ease'
  }}>
    {
      actual?.tipo === 'cita'
        ? actual?.area
        : actual?.codigo || '---'
    }
  </h1>

{actual?.tipo === 'cita' && (
  <div style={{
    textAlign: 'center',
    marginTop: '-10px'
  }}>

    <p style={{
      fontSize: '42px',
      fontWeight: 'bold',
      color: '#111',
      marginBottom: '10px'
    }}>
    Paciente {actual?.nombre_paciente}
    </p>

   <p style={{
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#444'
}}>
  Con {
  actual?.mensaje
    ?.replace('Paciente con ', '')
}
</p>

  </div>
)}

</div>

        <p style={{
  color: '#555',
  fontSize: '20px',
  fontWeight: 'bold',
  textAlign: 'center'
}}>
  {
    actual?.tipo === 'cita'
      ? 'Favor de pasar a consultorio'
      : 'Favor de pasar a consultorio'
  }
</p>

        </div>

        {/* DERECHA */}
<div style={{
  flex: 1.3,
  borderLeft: '1px solid #ddd',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: '#fff'
}}>

  <div style={{
    flex: 1,
    overflow: 'hidden'
  }}>
    <img
      src={imagenes[imagenActual]}
      alt="CECAN"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </div>

  <div style={{
    padding: '15px',
    textAlign: 'center',
    borderTop: '1px solid #eee',
    backgroundColor: '#fafafa'
  }}>
    <div style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#2f5fd0'
    }}>
      {fechaHora.toLocaleTimeString('es-MX')}
    </div>

    <div style={{
      fontSize: '18px',
      color: '#666'
    }}>
      {fechaHora.toLocaleDateString('es-MX')}
    </div>
  </div>

</div>

      </div>

      {/* HISTORIAL */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px'
      }}>

        <h3 style={{
          textAlign: 'center',
          color: '#2f5fd0',
          marginBottom: '20px'
        }}>
          Historial de últimos llamados
        </h3>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {historial.map((l, i) => (
            <div key={i} style={{
              width: '150px',
              backgroundColor: '#f5f7fb',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <p style={{ color: '#2f5fd0', fontWeight: 'bold' }}>
                {i + 1}.
              </p>

              <h3>{l.codigo || l.mensaje}</h3>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

export default App;