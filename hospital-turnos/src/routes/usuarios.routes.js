console.log('🔥 usuarios.routes cargado');
import express from 'express';
import { obtenerDoctoresPorArea } from '../controllers/usuarios.controller.js';

const router = express.Router();

router.get('/por-area/:area_id', obtenerDoctoresPorArea);

export default router;