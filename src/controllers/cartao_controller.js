import { CartaoService } from '../services/cartao_service.js';

export class CartaoController {

  // =============================
  // CRIAR CARTÃO
  // =============================
  static async criarCartao(req, res) {
    try {

      const usuario_id = req.user.usuario_id;

      const cartao = await CartaoService.criarCartao(usuario_id);

      return res.status(201).json(cartao);

    } catch (error) {
      return res.status(400).json({
        error: error.message
      });
    }
  }


  // =============================
  // LISTAR MEUS CARTÕES
  // =============================
  static async listarMeusCartoes(req, res) {
    try {

      const usuario_id = req.user.usuario_id;

      const cartoes = await CartaoService.listarMeusCartoes(usuario_id);

      return res.status(200).json(cartoes);

    } catch (error) {
      return res.status(500).json({
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
      const { novoLimite } = req.body;

      const cartao = await CartaoService.alterarLimite(
        id,
        novoLimite
      );
      
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


  // =============================
  // DELETAR CARTÃO
  // =============================
  static async deletarCartao(req, res) {
    try {

      const { id } = req.params;

      const resultado = await CartaoService.deletarCartao(id);

      return res.status(200).json(resultado);

    } catch (error) {
      return res.status(404).json({
        error: error.message
      });
    }
  }

}