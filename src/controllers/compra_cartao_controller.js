import { CompraCartaoService } from '../services/compra_cartao_service.js'

export class CompraCartaoController {

  // ======================================
  // REALIZAR COMPRA
  // ======================================
  static async realizarCompra(req, res, next) {
    try {

      const usuario_id = req.user.usuario_id

      const {
        numero_cartao,
        cvv,
        valor_total,
        quantidade_parcelas,
        descricao
      } = req.body

      const compra = await CompraCartaoService.realizarCompra({
        usuario_id,
        numero_cartao,
        cvv,
        valor_total,
        quantidade_parcelas,
        descricao
      })

      return res.status(201).json(compra)

    } catch (error) {
      next(error)
    }
  }


  // ======================================
  // LISTAR MINHAS COMPRAS
  // ======================================
  static async listarMinhasCompras(req, res, next) {
    try {

      const usuario_id = req.user.usuario_id

      const compras =
        await CompraCartaoService.listarComprasUsuario(usuario_id)

      return res.status(200).json(compras)

    } catch (error) {
      next(error)
    }
  }


  // ======================================
  // BUSCAR POR ID
  // ======================================
  static async buscarPorId(req, res, next) {
    try {

      const usuario_id = req.user.usuario_id
      const id = Number(req.params.id)   // ✅ CONVERSÃO IMPORTANTE

      const compra =
        await CompraCartaoService.buscarCompraPorId(usuario_id, id)

      return res.status(200).json(compra)

    } catch (error) {
      next(error)
    }
  }


  // ======================================
  // CANCELAR COMPRA
  // ======================================
  static async cancelarCompra(req, res, next) {
    try {

      const usuario_id = req.user.usuario_id
      const id = Number(req.params.id)   // ✅ CONVERSÃO IMPORTANTE

      const compra =
        await CompraCartaoService.cancelarCompra(usuario_id, id)

      return res.status(200).json(compra)

    } catch (error) {
      next(error)
    }
  }

}