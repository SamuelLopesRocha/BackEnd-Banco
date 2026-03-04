import { Cobranca } from '../models/cobranca_model.js';

export class CobrancaController {
  static async criar(req, res) {
    try {
      const cobranca = await Cobranca.create({
        usuario_id: req.user.usuario_id,
        valor: req.body.valor,
        codigo_pix: req.body.codigo_pix,
        tipo: req.body.tipo
      });
      return res.status(201).json(cobranca);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async listar(req, res) {
    try {
      const cobrancas = await Cobranca.find({ usuario_id: req.user.usuario_id }).sort({ createdAt: -1 });
      return res.status(200).json(cobrancas);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deletar(req, res) {
    try {
      await Cobranca.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Cobrança deletada.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}