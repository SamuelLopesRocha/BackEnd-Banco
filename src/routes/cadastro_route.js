import express from 'express';
import {
  createCadastro,
  listCadastros,
  getCadastroById,
  updateCadastro,
  deleteCadastro,
} from '../controllers/cadastro_controller.js';
const router = express.Router();

/* ===============================
   🏥 ROTAS DE CADASTRO 
================================== */

router.post('/', createCadastro);
router.get('/', listCadastros);
router.get('/:id', getCadastroById);
router.put('/:id', updateCadastro);
router.delete('/:id', deleteCadastro);

export default router;