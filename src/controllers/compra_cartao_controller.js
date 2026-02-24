import { CompraCartaoService } from '../services/compra_cartao_service.js'

export class CompraCartaoController {

  // ======================================
  // REALIZAR COMPRA
  // ======================================
  static async realizarCompra(req, res) {
    try {

      const usuario_id = req.user.usuario_id

      const {
        cartao_id,
        valor_total,
        quantidade_parcelas,
        descricao
      } = req.body

      const compra = await CompraCartaoService.realizarCompra({
        usuario_id,
        cartao_id,
        valor_total,
        quantidade_parcelas,
        descricao
      })

      return res.status(201).json(compra)

    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }


  // ======================================
  // LISTAR MINHAS COMPRAS
  // ======================================
  static async listarMinhasCompras(req, res) {
    try {

      const usuario_id = req.user.usuario_id
      const { page, limit } = req.query

      const resultado = await CompraCartaoService.listarComprasUsuario(
        usuario_id,
        page,
        limit
      )

      return res.status(200).json(resultado)

    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }


  // ======================================
  // BUSCAR COMPRA POR ID
  // ======================================
  static async buscarPorId(req, res) {
    try {

      const usuario_id = req.user.usuario_id
      const { id } = req.params

      const compra = await CompraCartaoService.buscarCompraPorId(
        usuario_id,
        id
      )

      return res.status(200).json(compra)

    } catch (error) {
      return res.status(404).json({ error: error.message })
    }
  }


  // ======================================
  // CANCELAR COMPRA
  // ======================================
  static async cancelarCompra(req, res) {
    try {

      const usuario_id = req.user.usuario_id
      const { id } = req.params

      const compra = await CompraCartaoService.cancelarCompra(
        usuario_id,
        id
      )

      return res.status(200).json(compra)

    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

}