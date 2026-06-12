import express from 'express';
import cors from 'cors';

import areasRoutes from './routes/areas.routes.js';
import llamadosRoutes from './routes/llamados.routes.js';
import authRoutes from './routes/auth.routes.js';
import turnosRoutes from './routes/turnos.routes.js';
import reporteRoutes from './routes/reporte.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';


const app = express(); // 👈 PRIMERO crear app

app.use(cors());
app.use(express.json());

// 🔥 RUTA DE PRUEBA
app.get('/api/test', (req, res) => {
  res.send('FUNCIONA TEST');
});

// LAS RUTAS
app.use('/api', areasRoutes);
app.use('/api', llamadosRoutes);
app.use('/api', authRoutes);
app.use('/api', turnosRoutes);
app.use('/api', reporteRoutes);
app.use('/api/usuarios', usuariosRoutes);

const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});