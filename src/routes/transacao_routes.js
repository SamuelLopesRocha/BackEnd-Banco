import express from 'express';
import { TransacaoController } from '../controllers/transacao_controller.js';

const router = express.Router();

router.post('/pix', TransacaoController.enviarPix);
router.post('/deposito', TransacaoController.depositar);
router.post('/saque', TransacaoController.sacar);
router.get('/conta/:id_conta', TransacaoController.listarTransacoesConta);

export default router;
