import { TransacaoService } from '../services/transacao_service.js';

export class TransacaoController {

  // ======================================
  // PIX
  // ======================================
  static async enviarPix(req, res) {
    try {

      const { conta_origem, conta_destino, valor, descricao } = req.body;

      const transacao = await TransacaoService.enviarPix({
        contaOrigemNumero: conta_origem,
        contaDestinoNumero: conta_destino,
        valor,
        descricao
      });

      return res.status(201).json(transacao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // ======================================
  // DEPÓSITO
  // ======================================
  static async depositar(req, res) {
    try {

      const { conta_destino, valor, descricao } = req.body;

      const transacao = await TransacaoService.depositar({
        contaDestinoNumero: conta_destino,
        valor,
        descricao
      });

      return res.status(201).json(transacao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // ======================================
  // SAQUE
  // ======================================
  static async sacar(req, res) {
    try {

      const { conta_origem, valor, descricao } = req.body;

      const transacao = await TransacaoService.sacar({
        contaOrigemNumero: conta_origem,
        valor,
        descricao
      });

      return res.status(201).json(transacao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // ======================================
  // EXTRATO
  // ======================================
  static async listarTransacoesConta(req, res) {
    try {

      const { id_conta } = req.params;

      const transacoes = await TransacaoService.listarPorConta(id_conta);

      return res.status(200).json(transacoes);

    } catch (error) {

      return res.status(500).json({
        error: error.message
      });

    }
  }

}
