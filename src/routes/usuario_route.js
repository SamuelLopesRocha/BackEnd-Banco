import express from 'express';
import {
  createUsuario,
  listUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
  getMeusDados,
} from '../controllers/usuario_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

router.post('/', createUsuario);
router.get('/', listUsuarios);
router.get('/meus-dados', authMiddleware, getMeusDados);
router.get('/:id', getUsuarioById);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;