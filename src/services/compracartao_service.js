import { Fatura } from '../models/fatura_model.js'
import { Cartao } from '../models/cartao_model.js'
import FaturaService from './fatura_service.js'

export default class CompraCartaoService {

  // ===============================
  // CRIAR COMPRA
  // ===============================
  static async criarCompra(dados) {

    const { cartao_id, valor_total, quantidade_parcelas, descricao } = dados

    // ============================
    // BUSCAR CARTÃO
    // ============================

    const cartao = await Cartao.findOne({ numero_cartao: cartao_id })

    if (!cartao)
      throw new Error('Cartão não encontrado')

    if (cartao.status_cartao !== 'ATIVO')
      throw new Error('Cartão não está ativo')

    if ((cartao.limite_utilizado + valor_total) > cartao.limite_total)
      throw new Error('Limite insuficiente')

    // ============================
    // OBTER OU CRIAR FATURA
    // ============================

    const fatura = await FaturaService.obterOuCriarFatura(
      cartao_id,
      cartao.conta_id,
      new Date()
    )

    // ============================
    // CRIAR COMPRA NA FATURA
    // ============================

    fatura.valor_total += valor_total

    await fatura.save()

    // ============================
    // ATUALIZAR LIMITE CARTÃO
    // ============================

    cartao.limite_utilizado += valor_total
    await cartao.save()

    return {
      mensagem: 'Compra criada com sucesso',
      valor_total,
      quantidade_parcelas,
      descricao,
      fatura_id: fatura._id
    }
  }

}