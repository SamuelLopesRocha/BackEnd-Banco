import express from 'express';
import { TransacaoController } from '../controllers/transacao_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/deposito', TransacaoController.depositar);
router.post('/saque', TransacaoController.sacar);
router.get('/extrato', TransacaoController.listarMinhasTransacoes);

export default router;