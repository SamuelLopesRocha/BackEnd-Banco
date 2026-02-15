import mongoose from 'mongoose';
import { Conta } from '../models/conta_model.js';
import { Transacao } from '../models/transacao_model.js';

export class TransacaoService {

  // ======================================
  // 🔹 MÉTODO BASE (NÚCLEO)
  // ======================================
  static async criarTransacao({
    contaOrigemNumero,
    contaDestinoNumero = null,
    tipo,
    valor,
    descricao
  }) {

    const session = await mongoose.startSession();

    try {

      session.startTransaction();

      // 🔒 CONVERTER PARA STRING (PADRÃO BANCÁRIO)
      const origemNumero = String(contaOrigemNumero);
      const destinoNumero = contaDestinoNumero
        ? String(contaDestinoNumero)
        : null;

      // 🔎 BUSCAR CONTA ORIGEM
      const contaOrigem = await Conta.findOne({
        $or: [
          { numero_conta: origemNumero },
          { numero_conta: Number(origemNumero) }
        ]
      }).session(session);


      if (!contaOrigem) {
        throw new Error('Conta de origem não encontrada');
      }

      let contaDestino = null;

      // 🔎 BUSCAR CONTA DESTINO
      if (destinoNumero) {

      contaDestino = await Conta.findOne({
        $or: [
        { numero_conta: destinoNumero },
        { numero_conta: Number(destinoNumero) }
        ]
      }).session(session);


        if (!contaDestino) {
          throw new Error('Conta de destino não encontrada');
        }

      }

      // 💰 VALIDAR VALOR
      if (!valor || valor <= 0) {
        throw new Error('Valor inválido');
      }

      // 💰 VALIDAR SALDO
      if (['PIX', 'TED', 'SAQUE'].includes(tipo)) {

        if (contaOrigem.saldo < valor) {
          throw new Error('Saldo insuficiente');
        }

      }

      // 📊 SALDOS ANTES
      const saldoAntesOrigem = contaOrigem.saldo;
      const saldoAntesDestino = contaDestino ? contaDestino.saldo : null;

      // 🔄 MOVIMENTAÇÃO
      if (['PIX', 'TED'].includes(tipo)) {

        contaOrigem.saldo -= valor;
        contaDestino.saldo += valor;

      }

      if (tipo === 'DEPOSITO') {
        contaOrigem.saldo += valor;
      }

      if (tipo === 'SAQUE') {
        contaOrigem.saldo -= valor;
      }

      // 📊 SALDOS DEPOIS
      const saldoDepoisOrigem = contaOrigem.saldo;
      const saldoDepoisDestino = contaDestino ? contaDestino.saldo : null;

      // 💾 SALVAR CONTAS
      await contaOrigem.save({ session });

      if (contaDestino) {
        await contaDestino.save({ session });
      }

      // 🧾 REGISTRAR TRANSAÇÃO
      const transacao = new Transacao({
        conta_origem: origemNumero,
        conta_destino: destinoNumero,
        tipo,
        valor,
        saldo_antes: saldoAntesOrigem,
        saldo_depois: saldoDepoisOrigem,
        saldo_antes_destino: saldoAntesDestino,
        saldo_depois_destino: saldoDepoisDestino,
        descricao,
        status: 'CONCLUIDA'
      });

      await transacao.save({ session });

      await session.commitTransaction();

      return transacao;

    } catch (error) {

      await session.abortTransaction();
      throw error;

    } finally {

      session.endSession();

    }
  }


  // ======================================
  // 💸 PIX
  // ======================================
  static async enviarPix({ contaOrigemNumero, contaDestinoNumero, valor, descricao }) {

    return this.criarTransacao({
      contaOrigemNumero,
      contaDestinoNumero,
      tipo: 'PIX',
      valor,
      descricao
    });

  }


  // ======================================
  // 💰 DEPÓSITO
  // ======================================
  static async depositar({ contaDestinoNumero, valor, descricao }) {

    return this.criarTransacao({
      contaOrigemNumero: contaDestinoNumero,
      tipo: 'DEPOSITO',
      valor,
      descricao
    });

  }


  // ======================================
  // 💳 SAQUE
  // ======================================
  static async sacar({ contaOrigemNumero, valor, descricao }) {

    return this.criarTransacao({
      contaOrigemNumero,
      tipo: 'SAQUE',
      valor,
      descricao
    });

  }


  // ======================================
  // 📄 EXTRATO
  // ======================================
  static async listarPorConta(numeroConta) {

    const numero = String(numeroConta);

    return Transacao.find({
      $or: [
        { conta_origem: numero },
        { conta_destino: numero }
      ]
    }).sort({ data_transacao: -1 });

  }

}
