import express from 'express';
import { FaturaController } from '../controllers/fatura_controller.js';

const router = express.Router();

// Criar fatura
router.post('/', FaturaController.criar);

// Listar faturas por cartão
router.get('/cartao/:cartao_id', FaturaController.listarPorCartao);

// Buscar fatura por ID
router.get('/:id', FaturaController.buscarPorId);

// Fechar fatura
router.patch('/:id/fechar', FaturaController.fechar);

// Pagar fatura
router.patch('/:id/pagar', FaturaController.pagar);

export default router;
