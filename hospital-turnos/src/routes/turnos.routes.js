import express from 'express';
import { 
  crearTurno, 
  llamarTurno, 
  registrarAtencionCita 
} from '../controllers/turnos.controller.js';

const router = express.Router();

// Turnos
router.post('/turnos', crearTurno);
router.post('/turnos/llamar', llamarTurno);

// 🔥 Citas (botón doctor)
router.post('/atenciones/cita', registrarAtencionCita);

export default router;