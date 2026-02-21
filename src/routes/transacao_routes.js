import express from 'express';
import { TransacaoController } from '../controllers/transacao_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/pix', TransacaoController.enviarPix);
router.post('/deposito', TransacaoController.depositar);
router.post('/saque', TransacaoController.sacar);
router.get('/:id_conta', TransacaoController.listarTransacoesConta);

export default router;
