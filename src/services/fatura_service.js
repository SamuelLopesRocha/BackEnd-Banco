import mongoose from 'mongoose'
import { Fatura } from '../models/fatura_model.js'
import { Cartao } from '../models/cartao_model.js'
import { Conta } from '../models/conta_model.js'

export default class FaturaService {

  // ===============================
  // VALIDACOES
  // ===============================
  static normalizarIdNumerico(valor, campo) {
    const numero = Number(valor)

    if (!Number.isInteger(numero) || numero <= 0) {
      throw new Error(`${campo} invalido`)
    }

    return numero
  }

  static normalizarValor(valor, campo = 'Valor') {
    const numero = Number(valor)

    if (!Number.isFinite(numero) || numero < 0) {
      throw new Error(`${campo} invalido`)
    }

    return Math.round(numero * 100) / 100
  }

  static normalizarData(dataCompra) {
    const data = dataCompra ? new Date(dataCompra) : new Date()

    if (Number.isNaN(data.getTime())) {
      throw new Error('Data da compra invalida')
    }

    return data
  }

  static aplicarSession(query, session) {
    return session ? query.session(session) : query
  }


  // ===============================
  // OBTER OU CRIAR FATURA
  // ===============================
  static async obterOuCriarFatura({
    cartao_id,
    conta_id,
    data_compra,
    session
  } = {}) {

    const cartaoId = this.normalizarIdNumerico(cartao_id, 'cartao_id')
    const contaId = this.normalizarIdNumerico(conta_id, 'conta_id')
    const data = this.normalizarData(data_compra)

    let dia = data.getDate()
    let mes = data.getMonth() + 1
    let ano = data.getFullYear()

    const DIA_FECHAMENTO = 10
    const DIA_VENCIMENTO = 20

    if (dia > DIA_FECHAMENTO) {
      mes += 1

      if (mes > 12) {
        mes = 1
        ano += 1
      }
    }

    const mesReferencia = `${ano}-${String(mes).padStart(2, '0')}`

    let fatura = await this.aplicarSession(
      Fatura.findOne({
        cartao_id: cartaoId,
        mes_referencia: mesReferencia
      }),
      session
    )

    if (!fatura) {

      const dataFechamento = new Date(ano, mes - 1, DIA_FECHAMENTO)
      const dataVencimento = new Date(ano, mes - 1, DIA_VENCIMENTO)

      const dadosFatura = {
        cartao_id: cartaoId,
        conta_id: contaId,
        mes_referencia: mesReferencia,
        valor_total: 0,
        data_fechamento: dataFechamento,
        data_vencimento: dataVencimento,
        status_fatura: 'ABERTA'
      }

      if (session) {
        const faturasCriadas = await Fatura.create([dadosFatura], { session })
        fatura = faturasCriadas[0]
      } else {
        fatura = await Fatura.create(dadosFatura)
      }
    }

    return fatura
  }


  // ===============================
  // CRIAR FATURA
  // ===============================
  static async criarFatura({
    cartao_id,
    conta_id,
    data_compra
  } = {}) {
    return this.obterOuCriarFatura({
      cartao_id,
      conta_id,
      data_compra
    })
  }


  // ===============================
  // INCLUIR VALOR DE COMPRA
  // ===============================
  static async incluirCompra({
    cartao_id,
    conta_id,
    valor,
    data_compra,
    session
  } = {}) {
    const valorCompra = this.normalizarValor(valor)

    const fatura = await this.obterOuCriarFatura({
      cartao_id,
      conta_id,
      data_compra,
      session
    })

    if (fatura.status_fatura !== 'ABERTA') {
      throw new Error('Apenas faturas abertas podem receber compras')
    }

    fatura.valor_total = this.normalizarValor(
      Number(fatura.valor_total || 0) + valorCompra
    )

    await fatura.save({ session })

    return fatura
  }


  // ===============================
  // REMOVER VALOR DE COMPRA
  // ===============================
  static async removerCompra({
    fatura_id,
    valor,
    session
  } = {}) {
    if (!mongoose.Types.ObjectId.isValid(String(fatura_id || ''))) {
      return null
    }

    const fatura = await this.aplicarSession(
      Fatura.findById(fatura_id),
      session
    )

    if (!fatura) {
      return null
    }

    if (fatura.status_fatura !== 'ABERTA') {
      throw new Error('Compra em fatura fechada nao pode ser cancelada')
    }

    const valorCompra = this.normalizarValor(valor)
    const novoTotal = Number(fatura.valor_total || 0) - valorCompra

    fatura.valor_total = this.normalizarValor(Math.max(0, novoTotal))

    await fatura.save({ session })

    return fatura
  }


  // ===============================
  // LISTAR POR CARTAO
  // ===============================
  static async listarPorCartao(cartaoId) {

    const cartao_id = this.normalizarIdNumerico(cartaoId, 'cartao_id')

    return await Fatura.find({
      cartao_id
    }).sort({ mes_referencia: -1 })

  }


  // ===============================
  // BUSCAR POR ID
  // ===============================
  static async buscarPorId(id) {

    const id_fatura = this.normalizarIdNumerico(id, 'id_fatura')

    const fatura = await Fatura.findOne({
      id_fatura
    })

    if (!fatura) {
      throw new Error('Fatura nao encontrada')
    }

    return fatura
  }


  // ===============================
  // FECHAR FATURA
  // ===============================
  static async fecharFatura(faturaId) {

    const id_fatura = this.normalizarIdNumerico(faturaId, 'id_fatura')

    const fatura = await Fatura.findOne({
      id_fatura
    })

    if (!fatura) {
      throw new Error('Fatura nao encontrada')
    }

    if (fatura.status_fatura !== 'ABERTA') {
      throw new Error('Apenas faturas abertas podem ser fechadas')
    }

    fatura.status_fatura = 'FECHADA'

    await fatura.save()

    return fatura
  }


  // ===============================
  // PAGAR FATURA
  // ===============================
  static async pagarFatura(faturaId) {

    const id_fatura = this.normalizarIdNumerico(faturaId, 'id_fatura')
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const fatura = await Fatura.findOne({
        id_fatura
      }).session(session)

      if (!fatura) {
        throw new Error('Fatura nao encontrada')
      }

      if (fatura.status_fatura === 'PAGA') {
        throw new Error('Fatura ja esta paga')
      }

      if (fatura.status_fatura !== 'FECHADA') {
        throw new Error('Apenas faturas fechadas podem ser pagas')
      }

      const valorFatura = this.normalizarValor(fatura.valor_total)

      const cartao = await Cartao.findOne({
        id_cartao: fatura.cartao_id
      }).session(session)

      if (!cartao) {
        throw new Error('Cartao nao encontrado')
      }

      const idsConta = [fatura.conta_id, cartao.conta_id]
        .map((valor) => Number(valor))
        .filter((valor) => Number.isInteger(valor) && valor > 0)

      const numerosConta = [fatura.conta_id, cartao.conta_id]
        .map((valor) => String(valor || '').trim())
        .filter(Boolean)

      const filtrosConta = [
        ...idsConta.map((id_conta) => ({ id_conta })),
        ...numerosConta.map((numero_conta) => ({ numero_conta }))
      ]

      const conta = await Conta.findOne({
        $or: filtrosConta
      }).session(session)

      if (!conta) {
        throw new Error('Conta nao encontrada')
      }

      if (conta.status_conta !== 'ATIVA') {
        throw new Error('Conta nao esta ativa')
      }

      if (Number(conta.saldo || 0) < valorFatura) {
        throw new Error('Saldo insuficiente para pagar fatura')
      }

      conta.saldo = this.normalizarValor(Number(conta.saldo || 0) - valorFatura)
      await conta.save({ session })

      cartao.limite_usado = this.normalizarValor(
        Math.max(0, Number(cartao.limite_usado || 0) - valorFatura)
      )
      await cartao.save({ session })

      fatura.status_fatura = 'PAGA'
      fatura.data_pagamento = new Date()
      fatura.conta_id = conta.id_conta
      await fatura.save({ session })

      await session.commitTransaction()

      return {
        mensagem: 'Fatura paga com sucesso',
        valor_pago: valorFatura,
        fatura
      }

    } catch (error) {

      await session.abortTransaction()
      throw error

    } finally {

      session.endSession()

    }
  }

}
