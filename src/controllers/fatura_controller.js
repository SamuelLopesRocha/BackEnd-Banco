import FaturaService from '../services/fatura_service.js';

export class FaturaController {

  static async criar(req, res) {
    try {
      const fatura = await FaturaService.criarFatura(req.body);
      return res.status(201).json(fatura);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async listarPorCartao(req, res) {
    try {
      const { cartao_id } = req.params;
      const faturas = await FaturaService.listarPorCartao(cartao_id);
      return res.json(faturas);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const fatura = await FaturaService.buscarPorId(id);
      return res.json(fatura);
    } catch (error) {
      return res.status(404).json({ erro: error.message });
    }
  }

  static async fechar(req, res) {
    try {
      const { id } = req.params;
      const fatura = await FaturaService.fecharFatura(id);
      return res.json(fatura);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async pagar(req, res) {
    try {
      const { id } = req.params;
      const fatura = await FaturaService.pagarFatura(id);
      return res.json(fatura);
    } catch (error) {
      return res.status(400).json({ erro: error.message });
    }
  }

}
