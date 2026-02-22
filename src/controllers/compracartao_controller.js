import CompraCartaoService from '../services/compracartao_service.js';

export class CompraCartaoController {

  static async criar(req, res) {
    try {
      const usuario_id = req.user.usuario_id;

      const resultado = await CompraCartaoService.criarCompra(
        req.body,
        usuario_id
      );

      return res.status(201).json(resultado);

    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async listarPorCartao(req, res) {
    try {
      const usuario_id = req.user.usuario_id;
      const { cartao_id } = req.params;

      const compras = await CompraCartaoService.listarPorCartao(
        cartao_id,
        usuario_id
      );

      return res.json(compras);

    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const usuario_id = req.user.usuario_id;
      const { id } = req.params;

      const compra = await CompraCartaoService.buscarPorId(
        id,
        usuario_id
      );

      return res.json(compra);

    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  static async cancelar(req, res) {
    try {
      const usuario_id = req.user.usuario_id;
      const { id } = req.params;

      const resultado = await CompraCartaoService.cancelarCompra(
        id,
        usuario_id
      );

      return res.json(resultado);

    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

}