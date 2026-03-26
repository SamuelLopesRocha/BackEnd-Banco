import { Boleto } from '../models/boleto_model.js';
import { Conta } from '../models/conta_model.js';
import { Transacao } from '../models/transacao_model.js';
import mongoose from 'mongoose';

export class BoletoController {
  // Gerar um novo boleto a receber
  static async gerar(req, res) {
    try {
      const { valor, vencimento } = req.body;
      const usuario_id = req.user.usuario_id;

      const conta = await Conta.findOne({ usuario_id });
      if (!conta) return res.status(404).json({ error: "Conta não encontrada." });

      // Gera números aleatórios para simular a linha digitável e o código de barras
      const numAleatorio = Math.floor(Math.random() * 100000000000000).toString().padStart(14, '0');
      const linhaDigitavel = `34191.09008 63391.234567 89101.${numAleatorio.substring(0, 5)} 1 ${numAleatorio}`;
      const codigoBarras = `34191${numAleatorio}6339123456789101`; // Versão apenas com números para o leitor

      const novoBoleto = await Boleto.create({
        usuario_id,
        conta_id: conta.numero_conta,
        valor,
        linha_digitavel: linhaDigitavel,
        codigo_barras: codigoBarras,
        vencimento: new Date(vencimento),
        status: 'PENDENTE'
      });

      return res.status(201).json(novoBoleto);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao gerar boleto." });
    }
  }

  // Listar boletos pendentes do usuário
  static async listarPendentes(req, res) {
    try {
      const usuario_id = req.user.usuario_id;
      const boletos = await Boleto.find({ usuario_id, status: 'PENDENTE' }).sort({ createdAt: -1 });
      return res.status(200).json(boletos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar boletos." });
    }
  }

  // Cancelar/Deletar boleto
  static async cancelar(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.user.usuario_id;

      const boleto = await Boleto.findOneAndDelete({ _id: id, usuario_id });
      if (!boleto) return res.status(404).json({ error: "Boleto não encontrado." });

      return res.status(200).json({ message: "Boleto cancelado." });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao cancelar boleto." });
    }
  }

  // Pagar um boleto
  static async pagar(req, res) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const { codigo } = req.body; // Pode ser linha digitável ou código de barras lido pela câmera
      const usuario_id = req.user.usuario_id;

      // 1. Busca a conta de quem está pagando
      const contaPagador = await Conta.findOne({ usuario_id }).session(session);
      
      // 2. Busca se este boleto existe no nosso banco (ignorando espaços ou pontos)
      const codigoLimpo = codigo.replace(/[\s.]/g, '');
      const boleto = await Boleto.findOne({ 
        $or: [
          { linha_digitavel: { $regex: new RegExp(codigoLimpo.substring(0, 10), "i") } },
          { codigo_barras: codigoLimpo }
        ],
        status: 'PENDENTE'
      }).session(session);

      if (!boleto) throw new Error("Boleto não encontrado no sistema ou já foi pago.");
      if (contaPagador.saldo < boleto.valor) throw new Error("Saldo insuficiente.");

      // 3. Desconta do pagador
      contaPagador.saldo -= boleto.valor;
      await contaPagador.save({ session });

      // 4. Se o boleto foi gerado por outra conta no nosso banco, adiciona o dinheiro pra ela
      const contaRecebedor = await Conta.findOne({ numero_conta: boleto.conta_id }).session(session);
      if (contaRecebedor && contaRecebedor.numero_conta !== contaPagador.numero_conta) {
        contaRecebedor.saldo += boleto.valor;
        await contaRecebedor.save({ session });
      }

      // 5. Marca boleto como pago
      boleto.status = 'PAGO';
      await boleto.save({ session });

      // 6. Registra no extrato
      await Transacao.create([{
        usuario_id,
        conta_origem: contaPagador.numero_conta,
        conta_destino: boleto.conta_id,
        tipo: 'PAGAMENTO_BOLETO',
        valor: boleto.valor,
        descricao: `Pagamento de Boleto`,
        status: 'CONCLUIDA'
      }], { session });

      await session.commitTransaction();
      return res.status(200).json({ message: "Boleto pago com sucesso!" });

    } catch (error) {
      await session.abortTransaction();
      return res.status(400).json({ error: error.message || "Erro ao processar pagamento." });
    } finally {
      session.endSession();
    }
  }
}