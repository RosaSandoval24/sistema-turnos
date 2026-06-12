import { Router } from 'express';
import { obtenerAreas } from '../controllers/areas.controller.js';

const router = Router();

// 📌 Obtener todas las áreas
router.get('/areas', obtenerAreas);

export default router;