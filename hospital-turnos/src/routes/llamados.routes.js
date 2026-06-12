import express from 'express';
import { obtenerLlamados, llamarSiguiente } from '../controllers/llamados.controller.js';

const router = express.Router();

router.get('/llamados', obtenerLlamados);
router.post('/llamar', llamarSiguiente); // 👈 ESTA ES CLAVE

export default router;