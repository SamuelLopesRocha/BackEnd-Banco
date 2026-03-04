import express from 'express';
import { CobrancaController } from '../controllers/cobranca_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();
router.use(authMiddleware);

router.post('/', CobrancaController.criar);
router.get('/', CobrancaController.listar);
router.delete('/:id', CobrancaController.deletar);

export default router;