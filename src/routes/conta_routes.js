import express from 'express';
import { 
  criarContaPoupanca,
  listarContasDoUsuario
} from '../controllers/conta_controller.js';

const router = express.Router();

// POST - Abrir conta poupança
router.post('/poupanca', criarContaPoupanca);

// GET - Listar contas do usuário
router.get('/:usuario_id', listarContasDoUsuario);

export default router;
