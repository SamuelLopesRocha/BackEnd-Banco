import { CartaoService } from '../services/cartao_service.js';

export class CartaoController {

  // =============================
  // CRIAR CARTÃO
  // =============================
  static async criarCartao(req, res) {
    try {

      const { conta_id } = req.body;

      const cartao = await CartaoService.criarCartao({
        contaId: conta_id
      });

      return res.status(201).json(cartao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // =============================
  // BUSCAR CARTÃO POR ID
  // =============================
  static async buscarCartao(req, res) {
    try {

      const { id } = req.params;

      const cartao = await CartaoService.buscarCartao(id);

      return res.status(200).json(cartao);

    } catch (error) {

      return res.status(404).json({
        error: error.message
      });

    }
  }


  // =============================
  // LISTAR CARTÕES DA CONTA
  // =============================
  static async listarPorConta(req, res) {
    try {

      const { conta_id } = req.params;

      const cartoes = await CartaoService.listarPorConta(conta_id);

      return res.status(200).json(cartoes);

    } catch (error) {

      return res.status(500).json({
        error: error.message
      });

    }
  }


  // =============================
  // BLOQUEAR CARTÃO
  // =============================
  static async bloquear(req, res) {
    try {

      const { id } = req.params;

      const cartao = await CartaoService.bloquearCartao(id);

      return res.status(200).json(cartao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // =============================
  // DESBLOQUEAR CARTÃO
  // =============================
  static async desbloquear(req, res) {
    try {

      const { id } = req.params;

      const cartao = await CartaoService.desbloquearCartao(id);

      return res.status(200).json(cartao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // =============================
  // ALTERAR LIMITE
  // =============================
  static async alterarLimite(req, res) {
    try {

      const { id } = req.params;
      const { limite } = req.body;

      const cartao = await CartaoService.alterarLimite(id, limite);

      return res.status(200).json(cartao);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }


  // =============================
  // CONSULTAR LIMITE
  // =============================
  static async consultarLimite(req, res) {
    try {

      const { id } = req.params;

      const limite = await CartaoService.consultarLimite(id);

      return res.status(200).json(limite);

    } catch (error) {

      return res.status(400).json({
        error: error.message
      });

    }
  }

}
