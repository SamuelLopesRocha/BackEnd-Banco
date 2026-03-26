import express from 'express';
import { BoletoController } from '../controllers/boleto_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

router.use(authMiddleware); // Todas as rotas precisam de login
router.post('/', BoletoController.gerar);
router.get('/pendentes', BoletoController.listarPendentes);
router.delete('/:id', BoletoController.cancelar);
router.post('/pagar', BoletoController.pagar);

export default router;