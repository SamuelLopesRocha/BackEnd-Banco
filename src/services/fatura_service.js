import { Fatura } from '../models/fatura_model.js'
import { Cartao } from '../models/cartao_model.js'
import { Conta } from '../models/conta_model.js'

export default class FaturaService {

  // ===============================
  // OBTER OU CRIAR FATURA
  // ===============================
  static async obterOuCriarFatura(cartaoId, contaId, dataCompra) {

    const data = new Date(dataCompra)

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

    let fatura = await Fatura.findOne({
      cartao_id: cartaoId,
      mes_referencia: mesReferencia
    })

    if (!fatura) {

      const dataFechamento = new Date(ano, mes - 1, DIA_FECHAMENTO)
      const dataVencimento = new Date(ano, mes - 1, DIA_VENCIMENTO)

      fatura = await Fatura.create({
        cartao_id: cartaoId,
        conta_id: contaId,
        mes_referencia: mesReferencia,
        valor_total: 0,
        data_fechamento: dataFechamento,
        data_vencimento: dataVencimento,
        status_fatura: 'ABERTA'
      })
    }

    return fatura
  }



  // ===============================
  // LISTAR POR CARTAO
  // ===============================
  static async listarPorCartao(cartaoId) {

    return await Fatura.find({
      cartao_id: cartaoId
    }).sort({ mes_referencia: -1 })

  }



  // ===============================
  // BUSCAR POR ID
  // ===============================
  static async buscarPorId(id) {

    const fatura = await Fatura.findOne({
      id_fatura: id
    })

    if (!fatura)
      throw new Error('Fatura não encontrada')

    return fatura
  }



  // ===============================
  // FECHAR FATURA
  // ===============================
  static async fecharFatura(faturaId) {

    const fatura = await Fatura.findOne({
      id_fatura: faturaId
    })

    if (!fatura)
      throw new Error('Fatura não encontrada')

    if (fatura.status_fatura !== 'ABERTA')
      throw new Error('Apenas faturas abertas podem ser fechadas')

    fatura.status_fatura = 'FECHADA'

    await fatura.save()

    return fatura
  }



  // ===============================
  // PAGAR FATURA (COMPLETO)
  // ===============================
  static async pagarFatura(faturaId) {

    const fatura = await Fatura.findOne({
      id_fatura: faturaId
    })

    if (!fatura)
      throw new Error('Fatura não encontrada')

    if (fatura.status_fatura === 'PAGA')
      throw new Error('Fatura já está paga')

    // ============================
    // BUSCAR CONTA
    // ============================

    const conta = await Conta.findOne({
      id_conta: fatura.conta_id
    })

    if (!conta)
      throw new Error('Conta não encontrada')

    if (conta.status_conta !== 'ATIVA')
      throw new Error('Conta não está ativa')

    // ============================
    // VALIDAR SALDO
    // ============================

    if (conta.saldo < fatura.valor_total)
      throw new Error('Saldo insuficiente para pagar fatura')

    // ============================
    // BUSCAR CARTÃO
    // ============================

    const cartao = await Cartao.findOne({
      id_cartao: fatura.cartao_id
    })

    if (!cartao)
      throw new Error('Cartão não encontrado')

    // ============================
    // DEBITAR CONTA
    // ============================

    conta.saldo -= fatura.valor_total
    await conta.save()

    // ============================
    // LIBERAR LIMITE CARTÃO
    // ============================

    cartao.limite_utilizado -= fatura.valor_total

    if (cartao.limite_utilizado < 0)
      cartao.limite_utilizado = 0

    await cartao.save()

    // ============================
    // ATUALIZAR FATURA
    // ============================

    fatura.status_fatura = 'PAGA'
    fatura.data_pagamento = new Date()

    await fatura.save()

    return {
      mensagem: 'Fatura paga com sucesso',
      valor_pago: fatura.valor_total,
      fatura
    }
  }

}
