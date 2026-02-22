import { TransacaoService } from '../services/transacao_service.js'

export class TransacaoController {

  // ======================================
  // DEPÓSITO
  // ======================================
  static async depositar(req, res) {
    try {

      const { valor, descricao } = req.body
      const usuario_id = req.user.usuario_id

      const transacao = await TransacaoService.depositar({
        usuario_id,
        valor,
        descricao
      })

      return res.status(201).json(transacao)

    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  // ======================================
  // SAQUE
  // ======================================
  static async sacar(req, res) {
    try {

      const { valor, descricao } = req.body
      const usuario_id = req.user.usuario_id

      const transacao = await TransacaoService.sacar({
        usuario_id,
        valor,
        descricao
      })

      return res.status(201).json(transacao)

    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  // ======================================
  // EXTRATO
  // ======================================
  static async listarMinhasTransacoes(req, res) {
    try {

      const usuario_id = req.user.usuario_id
      const { page, limit } = req.query

      const resultado = await TransacaoService.listarPorUsuario(
        usuario_id,
        page,
        limit
      )

      return res.status(200).json(resultado)

    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}