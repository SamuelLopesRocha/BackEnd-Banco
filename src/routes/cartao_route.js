import express from 'express';
import { CartaoController } from '../controllers/cartao_controller.js';

const router = express.Router();

router.post('/', CartaoController.criarCartao);

router.get('/:id', CartaoController.buscarCartao);

router.get('/conta/:conta_id', CartaoController.listarPorConta);

router.patch('/:id/bloquear', CartaoController.bloquear);

router.patch('/:id/desbloquear', CartaoController.desbloquear);

router.patch('/:id/limite', CartaoController.alterarLimite);

router.get('/:id/limite', CartaoController.consultarLimite);

export default router;
