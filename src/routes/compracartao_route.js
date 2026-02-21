import express from 'express';
import { CompraCartaoController } from '../controllers/compracartao_controller.js';

const router = express.Router();

// Criar compra
router.post('/', CompraCartaoController.criar);

// Listar compras por cartão
router.get('/cartao/:cartao_id', CompraCartaoController.listarPorCartao);

// Buscar compra por ID
router.get('/:id', CompraCartaoController.buscarPorId);

// Atualizar compra
router.put('/:id', CompraCartaoController.atualizar);

// Cancelar compra
router.patch('/:id/cancelar', CompraCartaoController.cancelar)

// Deletar compra
router.delete('/:id', CompraCartaoController.deletar);

export default router;
