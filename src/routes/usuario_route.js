import express from 'express';
import {
  createUsuario,
  listUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuario_controller.js';
const router = express.Router();

router.post('/', createUsuario);
router.get('/', listUsuarios);
router.get('/:id', getUsuarioById);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;