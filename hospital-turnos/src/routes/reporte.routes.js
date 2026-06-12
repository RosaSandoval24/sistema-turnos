import { Router } from 'express';
import { generarReporteSemanal } from '../controllers/reporte.controller.js';

const router = Router();

router.get('/reporte', generarReporteSemanal);

export default router;