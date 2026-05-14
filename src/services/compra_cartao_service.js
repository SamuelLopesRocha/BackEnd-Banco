import mongoose from 'mongoose'
import { CompraCartao } from '../models/compra_cartao_model.js'
import { Cartao } from '../models/cartao_model.js'
import FaturaService from './fatura_service.js'

export class CompraCartaoService {

  // ======================================
  // VALIDAR VALOR
  // ======================================
  static validarValor(valor) {

    const numero = Number(valor)

    if (!Number.isFinite(numero) || numero <= 0) {
      throw new Error('Valor invalido')
    }

    return Math.round(numero * 100) / 100
  }


  // ======================================
  // REALIZAR COMPRA
  // ======================================
  static async realizarCompra({
    usuario_id,
    numero_cartao,
    cvv,
    valor_total,
    quantidade_parcelas = 1,
    descricao
  }) {

    const session = await mongoose.startSession()

    try {

      session.startTransaction()

      const valor = this.validarValor(valor_total)

      if (!descricao || String(descricao).trim().length === 0 || descricao.length > 200) {
        throw new Error('Descricao invalida')
      }

      const parcelas = quantidade_parcelas === undefined || quantidade_parcelas === null || quantidade_parcelas === ''
        ? 1
        : Number(quantidade_parcelas)

      if (!Number.isInteger(parcelas) || parcelas <= 0) {
        throw new Error('Quantidade de parcelas invalida')
      }

      // ============================
      // BUSCAR CARTAO
      // ============================
      const cartao = await Cartao.findOne({
        numero_cartao,
        usuario_id: Number(usuario_id)
      }).session(session)

      if (!cartao) {
        throw new Error('Cartao nao encontrado')
      }

      if (cartao.status_cartao !== 'ATIVO') {
        throw new Error('Cartao nao esta ativo')
      }

      if (String(cartao.cvv) !== String(cvv)) {
        throw new Error('CVV invalido')
      }

      // ============================
      // VALIDAR LIMITE
      // ============================
      const limiteDisponivel =
        Number(cartao.limite_total || 0) -
        Number(cartao.limite_usado || 0)

      if (valor > limiteDisponivel) {
        throw new Error('Limite insuficiente')
      }

      // ============================
      // ATUALIZAR LIMITE
      // ============================
      cartao.limite_usado =
        Math.round((Number(cartao.limite_usado || 0) + valor) * 100) / 100

      await cartao.save({ session })

      // ============================
      // CRIAR OU ATUALIZAR FATURA
      // ============================
      const fatura = await FaturaService.incluirCompra({
        cartao_id: cartao.id_cartao,
        conta_id: cartao.conta_id,
        valor,
        data_compra: new Date(),
        session
      })

      // ============================
      // CRIAR COMPRA
      // ============================
      const compraCriada = await CompraCartao.create([{

        usuario_id: Number(usuario_id),
        cartao_id: cartao._id,
        fatura_id: fatura._id,
        incluida_fatura: true,

        valor_total:
          mongoose.Types.Decimal128.fromString(
            valor.toFixed(2)
          ),

        quantidade_parcelas: parcelas,
        descricao: String(descricao).trim(),
        status_compra: 'ATIVA'

      }], { session })

      await session.commitTransaction()

      return compraCriada[0]

    } catch (error) {

      await session.abortTransaction()
      throw error

    } finally {

      session.endSession()

    }
  }


  // ======================================
  // LISTAR COMPRAS
  // ======================================
  static async listarComprasUsuario(usuario_id) {

    return CompraCartao.find({
      usuario_id: Number(usuario_id)
    }).sort({ createdAt: -1 })

  }


  // ======================================
  // BUSCAR POR ID
  // ======================================
  static async buscarCompraPorId(usuario_id, id_compra) {

    const compra = await CompraCartao.findOne({
      id_compra: Number(id_compra),
      usuario_id: Number(usuario_id)
    })

    if (!compra) {
      throw new Error('Compra nao encontrada')
    }

    return compra
  }


  // ======================================
  // CANCELAR COMPRA
  // ======================================
  static async cancelarCompra(usuario_id, id_compra) {

    const session = await mongoose.startSession()

    try {

      session.startTransaction()

      const compra = await CompraCartao.findOne({
        id_compra: Number(id_compra),
        usuario_id: Number(usuario_id)
      }).session(session)

      if (!compra) {
        throw new Error('Compra nao encontrada')
      }

      if (compra.status_compra !== 'ATIVA') {
        throw new Error('Compra nao pode ser cancelada')
      }

      const cartao = await Cartao.findById(
        compra.cartao_id
      ).session(session)

      if (!cartao) {
        throw new Error('Cartao nao encontrado')
      }

      const valor = this.validarValor(
        compra.valor_total.toString()
      )

      // ============================
      // REMOVER DA FATURA
      // ============================
      if (compra.incluida_fatura && compra.fatura_id) {
        await FaturaService.removerCompra({
          fatura_id: compra.fatura_id,
          valor,
          session
        })
      }

      // ============================
      // ESTORNAR LIMITE
      // ============================
      cartao.limite_usado =
        Math.round((Number(cartao.limite_usado || 0) - valor) * 100) / 100

      if (cartao.limite_usado < 0) {
        cartao.limite_usado = 0
      }

      await cartao.save({ session })

      compra.status_compra = 'CANCELADA'
      compra.incluida_fatura = false
      await compra.save({ session })

      await session.commitTransaction()

      return compra

    } catch (error) {

      await session.abortTransaction()
      throw error

    } finally {

      session.endSession()
    }
  }
}
