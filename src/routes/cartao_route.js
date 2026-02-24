import express from 'express';
import { CartaoController } from '../controllers/cartao_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

// 🔐 TODAS PROTEGIDAS
router.post('/', authMiddleware, CartaoController.criarCartao);

router.get('/meus', authMiddleware, CartaoController.listarMeusCartoes);

router.get('/:id', authMiddleware, CartaoController.buscarCartao);

router.patch('/:id/bloquear', authMiddleware, CartaoController.bloquear);

router.patch('/:id/desbloquear', authMiddleware, CartaoController.desbloquear);

router.patch('/:id/limite', authMiddleware, CartaoController.alterarLimite);

router.get('/:id/limite', authMiddleware, CartaoController.consultarLimite);

router.delete('/:id', authMiddleware, CartaoController.deletarCartao);

export default router;