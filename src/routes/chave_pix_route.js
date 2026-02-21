import express from 'express';
import { ChavePixController } from '../controllers/chave_pix_controller.js';
import { authMiddleware } from '../middlewares/auth_middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', ChavePixController.cadastrar);
router.get('/', ChavePixController.listarMinhasChaves);
router.delete('/:chave', ChavePixController.excluir);
router.get('/consultar/:chave', ChavePixController.consultarOrigem);

export default router;