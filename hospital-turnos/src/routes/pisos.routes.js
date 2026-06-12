import express from 'express';
import { obtenerPisos } from '../controllers/pisos.controller.js';

const router = express.Router();

router.get('/pisos', obtenerPisos);

export default router;