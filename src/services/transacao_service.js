import mongoose from 'mongoose'
import { Conta } from '../models/conta_model.js'
import { Transacao } from '../models/transacao_model.js'
import { ChavePix } from '../models/chave_pix_model.js'
import { Cobranca } from '../models/cobranca_model.js' // 🔥 Importação do Model de Cobrança

export class TransacaoService {

  // ======================================
  // VALIDAR VALOR
  // ======================================
  static validarValor(valor) {
    const valorNumerico = Number(valor)

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      throw new Error('Valor inválido')
    }

    return Math.round(valorNumerico * 100) / 100
  }

  // ======================================
  // DEPÓSITO
  // ======================================
  static async depositar({ usuario_id, valor, descricao }) {

    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const valorValidado = this.validarValor(valor)

      if (descricao && descricao.length > 200) {
        throw new Error('Descrição muito longa (máx 200 caracteres)')
      }

      const usuarioIdNumerico = Number(usuario_id)

      const conta = await Conta.findOne({ usuario_id: usuarioIdNumerico }).session(session)

      if (!conta) {
        throw new Error('Conta não encontrada')
      }

      const saldoAntes = conta.saldo
      conta.saldo = Math.round((conta.saldo + valorValidado) * 100) / 100
      const saldoDepois = conta.saldo

      await conta.save({ session })

      const transacao = await Transacao.create([{
        usuario_id: usuarioIdNumerico,
        conta_origem: conta.numero_conta,
        tipo: 'DEPOSITO',
        valor: valorValidado,
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        descricao,
        status: 'CONCLUIDA'
      }], { session })

      await session.commitTransaction()

      return transacao[0]

    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  // ======================================
  // SAQUE
  // ======================================
  static async sacar({ usuario_id, valor, descricao }) {

    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const valorValidado = this.validarValor(valor)

      if (descricao && descricao.length > 200) {
        throw new Error('Descrição muito longa (máx 200 caracteres)')
      }

      const usuarioIdNumerico = Number(usuario_id)

      const conta = await Conta.findOne({ usuario_id: usuarioIdNumerico }).session(session)

      if (!conta) {
        throw new Error('Conta não encontrada')
      }

      if (conta.saldo < valorValidado) {
        throw new Error('Saldo insuficiente')
      }

      const saldoAntes = conta.saldo
      conta.saldo = Math.round((conta.saldo - valorValidado) * 100) / 100
      const saldoDepois = conta.saldo

      await conta.save({ session })

      const transacao = await Transacao.create([{
        usuario_id: usuarioIdNumerico,
        conta_origem: conta.numero_conta,
        tipo: 'SAQUE',
        valor: valorValidado,
        saldo_antes: saldoAntes,
        saldo_depois: saldoDepois,
        descricao,
        status: 'CONCLUIDA'
      }], { session })

      await session.commitTransaction()

      return transacao[0]

    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  // ======================================
  // PIX
  // ======================================
  // 🔥 Recebe o codigo_pix_pago agora
  static async pix({ usuario_id, chave, valor, descricao, codigo_pix_pago }) {

    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const valorValidado = this.validarValor(valor)
      const usuarioIdNumerico = Number(usuario_id)

      // Conta origem
      const contaOrigem = await Conta.findOne({ usuario_id: usuarioIdNumerico }).session(session)

      if (!contaOrigem) {
        throw new Error('Conta origem não encontrada')
      }

      if (contaOrigem.saldo < valorValidado) {
        throw new Error('Saldo insuficiente')
      }

      // Buscar chave PIX
      const chavePix = await ChavePix.findOne({ chave })

      if (!chavePix) {
        throw new Error('Chave Pix não encontrada')
      }

      // Conta destino
      const contaDestino = await Conta.findOne({
        numero_conta: chavePix.numero_conta
      }).session(session)

      if (!contaDestino) {
        throw new Error('Conta destino não encontrada')
      }

      if (contaDestino.numero_conta === contaOrigem.numero_conta) {
        throw new Error('Não é possível enviar Pix para a própria conta')
      }

      // ===== DEBITAR ORIGEM =====
      const saldoAntesOrigem = contaOrigem.saldo
      contaOrigem.saldo = Math.round((contaOrigem.saldo - valorValidado) * 100) / 100
      const saldoDepoisOrigem = contaOrigem.saldo

      await contaOrigem.save({ session })

      // ===== CREDITAR DESTINO =====
      const saldoAntesDestino = contaDestino.saldo
      contaDestino.saldo = Math.round((contaDestino.saldo + valorValidado) * 100) / 100
      const saldoDepoisDestino = contaDestino.saldo

      await contaDestino.save({ session })

      // ===== TRANSAÇÃO ENVIO =====
      await Transacao.create([{
        usuario_id: usuarioIdNumerico,
        conta_origem: contaOrigem.numero_conta,
        conta_destino: contaDestino.numero_conta,
        tipo: 'PIX_ENVIO',
        valor: valorValidado,
        saldo_antes: saldoAntesOrigem,
        saldo_depois: saldoDepoisOrigem,
        descricao,
        chave_pix: chave,
        tipo_chave_pix: chavePix.tipo_chave,
        status: 'CONCLUIDA'
      }], { session })

      // ===== TRANSAÇÃO RECEBIMENTO =====
      await Transacao.create([{
        usuario_id: contaDestino.usuario_id,
        conta_origem: contaOrigem.numero_conta,
        conta_destino: contaDestino.numero_conta,
        tipo: 'PIX_RECEBIMENTO',
        valor: valorValidado,
        saldo_antes: saldoAntesDestino,
        saldo_depois: saldoDepoisDestino,
        descricao,
        chave_pix: chave,
        tipo_chave_pix: chavePix.tipo_chave,
        status: 'CONCLUIDA'
      }], { session })

      // 🔥 DAR BAIXA NA COBRANÇA PENDENTE (Se foi paga via QR Code)
      if (codigo_pix_pago) {
        await Cobranca.findOneAndUpdate(
          { codigo_pix: codigo_pix_pago, status: 'PENDENTE' },
          { status: 'PAGA' },
          { session }
        )
      }

      await session.commitTransaction()

      return { 
        message: 'Pix realizado com sucesso',
        destinatario_id: contaDestino.usuario_id,
        valor: valorValidado,
        conta_origem: contaOrigem.numero_conta
      }

    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  // ======================================
  // EXTRATO
  // ======================================
  static async listarPorUsuario(usuario_id, page = 1, limit = 10) {

    const usuarioIdNumerico = Number(usuario_id)

    const pagina = Number(page) > 0 ? Number(page) : 1
    const limite = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 10
    const skip = (pagina - 1) * limite

    const transacoes = await Transacao.find({ usuario_id: usuarioIdNumerico })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limite)

    const total = await Transacao.countDocuments({ usuario_id: usuarioIdNumerico })

    return {
      pagina,
      limite,
      total,
      total_paginas: Math.ceil(total / limite),
      dados: transacoes
    }
  }
}