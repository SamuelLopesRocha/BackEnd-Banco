import CompraCartaoService from '../services/compracartao_service.js';

export class CompraCartaoController {

  static async criar(req, res) {
    try {
      const compra = await CompraCartaoService.criarCompra(req.body);
      return res.status(201).json(compra);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async listarPorCartao(req, res) {
    try {
      const { cartao_id } = req.params;
      const compras = await CompraCartaoService.listarPorCartao(cartao_id);
      return res.json(compras);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const compra = await CompraCartaoService.buscarPorId(id);
      return res.json(compra);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const compra = await CompraCartaoService.atualizarCompra(id, req.body);
      return res.json(compra);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async deletar(req, res) {
    try {
      const { id } = req.params;
      await CompraCartaoService.deletarCompra(id);
      return res.json({ mensagem: 'Compra removida com sucesso' });
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }
  static async cancelar(req, res) {
    try {
      const id = Number(req.params.id)
      const compra = await CompraCartaoService.cancelarCompra(id)

      return res.json({
        mensagem: 'Compra cancelada com sucesso',
        compra
      })

    } catch (error) {
      return res.status(400).json({ erro: error.message })
    }
    }
}
