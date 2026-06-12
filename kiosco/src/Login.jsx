import { useState } from 'react';

function Login({ setUser }) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const iniciarSesion = async () => {

    try {

      const res = await fetch(
        'http://192.168.1.72:3000/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        setMensaje(
          data.mensaje ||
          'Credenciales incorrectas'
        );

        return;
      }

      // 💾 guardar sesión
      localStorage.setItem(
        'user',
        JSON.stringify(data)
      );

      setUser(data);

    } catch (error) {

      console.error(error);

      setMensaje('Error de conexión');
    }
  };

  return (

    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background:
        'linear-gradient(135deg, #2f5fd0, #6ea8ff)',
      fontFamily: 'Arial'
    }}>

      <div style={{
        width: '380px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow:
          '0 10px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>

        {/* 🏥 LOGO */}
        <div style={{
          textAlign: 'center'
        }}>

          <div style={{
            width: '90px',
            height: '90px',
            margin: '0 auto 15px',
            borderRadius: '50%',
            backgroundColor: '#2f5fd0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '38px',
            fontWeight: 'bold'
          }}>
            C 
          </div>

          <h1 style={{
            margin: 0,
            color: '#2f5fd0'
          }}>
            Centro Estatal de Cancerologia Durango CECAN  
          </h1>

          <p style={{
            color: '#666',
            marginTop: '8px'
          }}>
            Sistema integral de espera  
          </p>

        </div>

        {/* 👤 USUARIO */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none'
          }}
        />

        {/* 🔒 PASSWORD */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid #ccc',
            fontSize: '16px',
            outline: 'none'
          }}
        />

        {/* 🔵 BOTÓN */}
        <button
          onClick={iniciarSesion}
          style={{
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#2f5fd0',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          Iniciar sesión
        </button>

        {/* ⚠️ MENSAJE */}
        {mensaje && (

          <div style={{
            backgroundColor: '#ffe5e5',
            color: '#d8000c',
            padding: '12px',
            borderRadius: '10px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {mensaje}
          </div>
        )}

      </div>

    </div>
  );
}

export default Login;