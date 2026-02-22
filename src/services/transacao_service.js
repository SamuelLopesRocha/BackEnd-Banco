import mongoose from 'mongoose'
import { Conta } from '../models/conta_model.js'
import { Transacao } from '../models/transacao_model.js'

export class TransacaoService {

  // ======================================
  // FUNÇÃO AUXILIAR PARA VALIDAR VALOR
  // ======================================
  static validarValor(valor) {
    const valorNumerico = Number(valor)

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      throw new Error('Valor inválido')
    }

    // Arredonda para 2 casas decimais
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

      const conta = await Conta.findOne({ usuario_id }).session(session)

      if (!conta) {
        throw new Error('Conta não encontrada')
      }

      const saldoAntes = conta.saldo
      conta.saldo = Math.round((conta.saldo + valorValidado) * 100) / 100
      const saldoDepois = conta.saldo

      await conta.save({ session })

      const transacao = await Transacao.create([{
        usuario_id,
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

      const conta = await Conta.findOne({ usuario_id }).session(session)

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
        usuario_id,
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
  // EXTRATO (COM PAGINAÇÃO)
  // ======================================
  static async listarPorUsuario(usuario_id, page = 1, limit = 10) {

    const pagina = Number(page) > 0 ? Number(page) : 1
    const limite = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 10
    const skip = (pagina - 1) * limite

    const transacoes = await Transacao.find({ usuario_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limite)

    const total = await Transacao.countDocuments({ usuario_id })

    return {
      pagina,
      limite,
      total,
      total_paginas: Math.ceil(total / limite),
      dados: transacoes
    }
  }
}