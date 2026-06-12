import { useState, useEffect } from 'react';
import Login from './Login';
import Doctor from './Doctor';
import Recepcion from './Recepcion.jsx';
import Kiosco from './Kiosco';

function App() {

  const [user, setUser] = useState(null);

  // cargar sesión
  useEffect(() => {

    const usuarioGuardado = localStorage.getItem('user');

    if (usuarioGuardado) {
      setUser(JSON.parse(usuarioGuardado));
    }

  }, []);

  // cerrar sesión
  const cerrarSesion = () => {

    localStorage.removeItem('user');
    setUser(null);
  };

  const path = window.location.pathname;

  console.log('USER:', user);

  // PANTALLA PRINCIPAL
  if (path === '/') {
    return <Kiosco />;
  }

  // PANEL
  if (path === '/panel') {

    // LOGIN
    if (!user) {
      return <Login setUser={setUser} />;
    }

    //  DEBUG
    console.log('ROL:', user?.rol);

    //  DOCTOR
    if (
      user?.rol?.trim().toLowerCase() === 'doctor'
    ) {
      return (
        <Doctor
          user={user}
          cerrarSesion={cerrarSesion}
        />
      );
    }

    //  RECEPCIÓN
    if (
      user?.rol?.trim().toLowerCase() === 'recepcion'
    ) {
      return (
        <Recepcion
          user={user}
          cerrarSesion={cerrarSesion}
        />
      );
    }

    //  ADMIN
    if (
      user?.rol?.trim().toLowerCase() === 'admin'
    ) {
      return (
        <Doctor
          user={user}
          cerrarSesion={cerrarSesion}
        />
      );
    }
  }

  //  fallback
  return (
    <div style={{
      textAlign: 'center',
      marginTop: '100px'
    }}>
      <h1>Página no encontrada</h1>
    </div>
  );
}

export default App;