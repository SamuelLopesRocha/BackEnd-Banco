import express from 'express';
import { CompraCartaoController } from '../controllers/compracartao_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Criar compra
router.post('/', CompraCartaoController.criar);

// Listar compras por cartão
router.get('/cartao/:cartao_id', CompraCartaoController.listarPorCartao);

// Buscar compra por ID
router.get('/:id', CompraCartaoController.buscarPorId);

// Cancelar compra
router.put('/cancelar/:id', CompraCartaoController.cancelar);

router.patch('/:id/cancelar', CompraCartaoController.cancelar);

export default router;