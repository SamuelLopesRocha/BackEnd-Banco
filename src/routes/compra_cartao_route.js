import express from 'express'
import { CompraCartaoController } from '../controllers/compra_cartao_controller.js'
import { authMiddleware } from '../middlewares/auth_middleware.js'

const router = express.Router()

router.use(authMiddleware)

router.post('/', CompraCartaoController.realizarCompra)
router.get('/', CompraCartaoController.listarMinhasCompras)
router.get('/:id', CompraCartaoController.buscarPorId)
router.patch('/:id/cancelar', CompraCartaoController.cancelarCompra)

export default router