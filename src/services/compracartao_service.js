import { CompraCartao } from '../models/compracartao_model.js';
import { Cartao } from '../models/cartao_model.js';
import { Conta } from '../models/conta_model.js';
import FaturaService from './fatura_service.js';
import mongoose from 'mongoose';

export default class CompraCartaoService {

  // =============================
  // CRIAR COMPRA
  // =============================
  static async criarCompra(dados, usuario_id) {

    if (!dados)
      throw new Error('Dados da compra não enviados');

    const { cartao_id, valor_total, quantidade_parcelas = 1, descricao } = dados;

    if (!cartao_id || !valor_total || !descricao)
      throw new Error('Dados obrigatórios inválidos');

    const valorTotalNumber = Number(valor_total);

    if (valorTotalNumber <= 0)
      throw new Error('Valor inválido');

    if (quantidade_parcelas <= 0)
      throw new Error('Quantidade de parcelas inválida');

    // =============================
    // BUSCAR CONTA
    // =============================
    const conta = await Conta.findOne({ usuario_id });

    if (!conta)
      throw new Error('Conta não encontrada');

    if (conta.status_conta !== 'ATIVA')
      throw new Error('Conta não está ativa');

    // =============================
    // BUSCAR CARTÃO
    // =============================
    const cartao = await Cartao.findById(cartao_id);

    if (!cartao)
      throw new Error('Cartão não encontrado');

    if (!cartao.conta_id.equals(conta._id))
      throw new Error('Cartão não pertence à sua conta');

    if (cartao.status_cartao !== 'ATIVO')
      throw new Error('Cartão não está ativo');

    const limiteDisponivel =
      Number(cartao.limite_credito) - Number(cartao.limite_utilizado);

    if (valorTotalNumber > limiteDisponivel)
      throw new Error('Limite insuficiente');

    const valorParcelaNumber = valorTotalNumber / quantidade_parcelas;
    const comprasCriadas = [];

    // =============================
    // GERAR PARCELAS
    // =============================
    for (let i = 1; i <= quantidade_parcelas; i++) {

      const dataParcela = new Date();
      dataParcela.setMonth(dataParcela.getMonth() + (i - 1));

      const fatura = await FaturaService.obterOuCriarFatura(
        cartao._id,
        conta._id,
        dataParcela
      );

      const compra = await CompraCartao.create({
        cartao_id: cartao._id,
        conta_id: conta._id,
        valor_total: mongoose.Types.Decimal128.fromString(valorTotalNumber.toString()),
        valor_parcela: mongoose.Types.Decimal128.fromString(valorParcelaNumber.toString()),
        quantidade_parcelas,
        parcela_atual: i,
        descricao,
        data_compra: dataParcela,
        fatura_id: fatura._id,
        incluida_fatura: true
      });

      // Atualiza fatura
      fatura.valor_total = mongoose.Types.Decimal128.fromString(
        (Number(fatura.valor_total) + valorParcelaNumber).toString()
      );

      await fatura.save();

      comprasCriadas.push(compra);
    }

    // =============================
    // ATUALIZAR LIMITE DO CARTÃO
    // =============================
    cartao.limite_utilizado = mongoose.Types.Decimal128.fromString(
      (Number(cartao.limite_utilizado) + valorTotalNumber).toString()
    );

    await cartao.save();

    return {
      mensagem: 'Compra realizada com sucesso',
      parcelas: comprasCriadas.length,
      compras: comprasCriadas
    };
  }


  // =============================
  // LISTAR POR CARTÃO
  // =============================
  static async listarPorCartao(cartao_id, usuario_id) {

    const conta = await Conta.findOne({ usuario_id });

    if (!conta)
      throw new Error('Conta não encontrada');

    const cartao = await Cartao.findById(cartao_id);

    if (!cartao || !cartao.conta_id.equals(conta._id))
      throw new Error('Cartão não pertence à sua conta');

    return await CompraCartao.find({
      cartao_id: cartao._id
    }).sort({ data_compra: 1 });
  }


  // =============================
  // BUSCAR POR ID
  // =============================
  static async buscarPorId(id_compra, usuario_id) {

    const conta = await Conta.findOne({ usuario_id });

    if (!conta)
      throw new Error('Conta não encontrada');

    const compra = await CompraCartao.findOne({
      id_compra,
      conta_id: conta._id
    });

    if (!compra)
      throw new Error('Compra não encontrada');

    return compra;
  }


  // =============================
  // CANCELAR COMPRA
  // =============================
  static async cancelarCompra(id_compra, usuario_id) {

    const conta = await Conta.findOne({ usuario_id });

    if (!conta)
      throw new Error('Conta não encontrada');

    const compra = await CompraCartao.findOne({
      id_compra,
      conta_id: conta._id
    });

    if (!compra)
      throw new Error('Compra não encontrada');

    if (compra.status_compra !== 'ATIVA')
      throw new Error('Compra não pode ser cancelada');

    const cartao = await Cartao.findById(compra.cartao_id);
    const fatura = await FaturaService.buscarPorId(compra.fatura_id);

    const valorParcela = Number(compra.valor_parcela);
    const valorTotal = Number(compra.valor_total);

    // devolver limite total
    cartao.limite_utilizado = mongoose.Types.Decimal128.fromString(
      Math.max(Number(cartao.limite_utilizado) - valorTotal, 0).toString()
    );

    await cartao.save();

    // remover valor da fatura
    fatura.valor_total = mongoose.Types.Decimal128.fromString(
      Math.max(Number(fatura.valor_total) - valorParcela, 0).toString()
    );

    await fatura.save();

    compra.status_compra = 'CANCELADA';
    await compra.save();

    return {
      mensagem: 'Compra cancelada com sucesso',
      compra
    };
  }
}