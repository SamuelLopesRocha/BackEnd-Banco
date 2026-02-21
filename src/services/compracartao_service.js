import { CompraCartao } from '../models/compracartao_model.js'
import FaturaService from './fatura_service.js'
import { Cartao } from '../models/cartao_model.js'
import { Conta } from '../models/conta_model.js'

export default class CompraCartaoService {

  // =============================
  // CRIAR COMPRA COM PARCELAMENTO
  // =============================
  static async criarCompra(dados) {

    if (!dados)
      throw new Error('Dados da compra não enviados')

    const cartaoId = Number(dados.cartao_id)
    const contaId = Number(dados.conta_id)
    const valorTotal = Number(dados.valor_total)
    const parcelas = Number(dados.quantidade_parcelas || 1)
    const descricao = dados.descricao
    const codigo = dados.codigo_autorizacao || 'AUTO'

    if (!cartaoId || !contaId || !valorTotal || !descricao)
      throw new Error('Dados obrigatórios inválidos')

    if (valorTotal <= 0)
      throw new Error('Valor da compra inválido')

    if (parcelas <= 0)
      throw new Error('Quantidade de parcelas inválida')

    const dataCompra = dados.data_compra
      ? new Date(dados.data_compra)
      : new Date()

    const valorParcela = valorTotal / parcelas

    // =============================
    // VALIDAR CARTÃO
    // =============================

    const cartao = await Cartao.findOne({ id_cartao: cartaoId })

    if (!cartao)
      throw new Error('Cartão não encontrado')

    if (cartao.status_cartao !== 'ATIVO')
      throw new Error('Cartão não está ativo')

    if (cartao.conta_id !== contaId)
      throw new Error('Cartão não pertence à conta informada')

    // =============================
    // VALIDAR CONTA
    // =============================

    const conta = await Conta.findOne({ id_conta: contaId })

    if (!conta)
      throw new Error('Conta não encontrada')

    if (conta.status_conta !== 'ATIVA')
      throw new Error('Conta não está ativa')

    // =============================
    // VALIDAR LIMITE
    // =============================

    const limiteDisponivel =
      cartao.limite_credito - cartao.limite_utilizado

    if (valorTotal > limiteDisponivel)
      throw new Error('Limite insuficiente no cartão')

    const comprasCriadas = []

    // =============================
    // GERAR PARCELAS AUTOMÁTICAS
    // =============================

    for (let i = 1; i <= parcelas; i++) {

      const dataParcela = new Date(dataCompra)
      dataParcela.setMonth(dataParcela.getMonth() + (i - 1))

      const fatura = await FaturaService.obterOuCriarFatura(
        cartaoId,
        contaId,
        dataParcela
      )

      const compra = await CompraCartao.create({
        cartao_id: cartaoId,
        conta_id: contaId,
        valor_total: valorTotal,
        valor_parcela: valorParcela,
        quantidade_parcelas: parcelas,
        parcela_atual: i,
        descricao,
        data_compra: dataParcela,
        status_compra: 'ATIVA',
        fatura_id: fatura.id_fatura,
        incluida_fatura: true,
        codigo_autorizacao: codigo
      })

      // atualizar fatura
      fatura.valor_total += valorParcela
      await fatura.save()

      comprasCriadas.push(compra)
    }

    // =============================
    // ATUALIZAR LIMITE CARTÃO
    // =============================

    cartao.limite_utilizado += valorTotal
    await cartao.save()

    return {
      mensagem: 'Compra realizada com sucesso',
      parcelas: comprasCriadas.length,
      compras: comprasCriadas
    }
  }

  // =============================
  // LISTAR POR CARTAO
  // =============================
  static async listarPorCartao(cartaoId) {

    return await CompraCartao.find({
      cartao_id: cartaoId
    }).sort({ data_compra: 1 })

  }

  // =============================
  // BUSCAR POR ID
  // =============================
  static async buscarPorId(id) {

    const compra = await CompraCartao.findOne({
      id_compra: id
    })

    if (!compra)
      throw new Error('Compra não encontrada')

    return compra
  }

  // =============================
  // CANCELAR COMPRA
  // =============================
  static async cancelarCompra(id) {

    const compra = await CompraCartao.findOne({
      id_compra: id
    })

    if (!compra)
      throw new Error('Compra não encontrada')

    if (compra.status_compra !== 'ATIVA')
      throw new Error('Compra não pode ser cancelada')

    // =============================
    // BUSCAR CARTÃO
    // =============================

    const cartao = await Cartao.findOne({
      id_cartao: compra.cartao_id
    })

    if (!cartao)
      throw new Error('Cartão não encontrado')

    // =============================
    // BUSCAR FATURA
    // =============================

    const fatura = await FaturaService.buscarPorId(
      compra.fatura_id
    )

    if (!fatura)
      throw new Error('Fatura não encontrada')

    // =============================
    // DEVOLVER LIMITE (APENAS PARCELA)
    // =============================

    cartao.limite_utilizado -= compra.valor_parcela

    if (cartao.limite_utilizado < 0)
      cartao.limite_utilizado = 0

    await cartao.save()

    // =============================
    // REMOVER VALOR DA FATURA
    // =============================

    fatura.valor_total -= compra.valor_parcela

    if (fatura.valor_total < 0)
      fatura.valor_total = 0

    await fatura.save()

    // =============================
    // ATUALIZAR STATUS
    // =============================

    compra.status_compra = 'CANCELADA'
    await compra.save()

    return {
      mensagem: 'Compra cancelada com sucesso',
      compra
    }
  }

}
