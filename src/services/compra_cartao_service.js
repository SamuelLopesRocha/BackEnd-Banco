import mongoose from 'mongoose'
import { CompraCartao } from '../models/compra_cartao_model.js'
import { Cartao } from '../models/cartao_model.js'

export class CompraCartaoService {

  // ======================================
  // VALIDAR VALOR
  // ======================================
  static validarValor(valor) {

    const numero = Number(valor)

    if (!Number.isFinite(numero) || numero <= 0) {
      throw new Error('Valor inválido')
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

      if (!descricao || descricao.length > 200) {
        throw new Error('Descrição inválida')
      }

      const parcelas = Number(quantidade_parcelas) || 1

      if (parcelas <= 0) {
        throw new Error('Quantidade de parcelas inválida')
      }

      // ============================
      // BUSCAR CARTÃO
      // ============================
      const cartao = await Cartao.findOne({
        numero_cartao,
        usuario_id: Number(usuario_id)
      }).session(session)

      if (!cartao) {
        throw new Error('Cartão não encontrado')
      }

      if (cartao.status_cartao !== 'ATIVO') {
        throw new Error('Cartão não está ativo')
      }

      if (String(cartao.cvv) !== String(cvv)) {
        throw new Error('CVV inválido')
      }

      // ============================
      // VALIDAR LIMITE
      // ============================
      const limiteDisponivel =
        Number(cartao.limite_credito) -
        Number(cartao.limite_utilizado)

      if (valor > limiteDisponivel) {
        throw new Error('Limite insuficiente')
      }

      // ============================
      // ATUALIZAR LIMITE
      // ============================
      cartao.limite_utilizado =
        Number(cartao.limite_utilizado) + valor

      await cartao.save({ session })

      // ============================
      // CRIAR COMPRA
      // ============================
      const compraCriada = await CompraCartao.create([{

        usuario_id: Number(usuario_id),
        cartao_id: cartao._id,

        valor_total:
          mongoose.Types.Decimal128.fromString(
            valor.toFixed(2)
          ),

        quantidade_parcelas: parcelas,
        descricao,
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
  // BUSCAR POR ID (CORRIGIDO)
  // ======================================
  static async buscarCompraPorId(usuario_id, id_compra) {

    const compra = await CompraCartao.findOne({
      id_compra: Number(id_compra),
      usuario_id: Number(usuario_id)
    })

    if (!compra) {
      throw new Error('Compra não encontrada')
    }

    return compra
  }


  // ======================================
  // CANCELAR COMPRA (CORRIGIDO)
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
        throw new Error('Compra não encontrada')
      }

      if (compra.status_compra !== 'ATIVA') {
        throw new Error('Compra não pode ser cancelada')
      }

      const cartao = await Cartao.findById(
        compra.cartao_id
      ).session(session)

      if (!cartao) {
        throw new Error('Cartão não encontrado')
      }

      const valor = parseFloat(
        compra.valor_total.toString()
      )

      // ============================
      // ESTORNAR LIMITE
      // ============================
      cartao.limite_utilizado =
        Number(cartao.limite_utilizado) - valor

      if (cartao.limite_utilizado < 0) {
        cartao.limite_utilizado = 0
      }

      await cartao.save({ session })

      compra.status_compra = 'CANCELADA'
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