import { Cartao } from '../models/cartao_model.js';
import { Conta } from '../models/conta_model.js';

export class CartaoService {

  // ==============================
  // 🔢 GERAR NÚMERO CARTÃO 16 DIGITOS
  // ==============================
  static gerarNumeroCartao() {

    let numero = '';

    for (let i = 0; i < 16; i++) {
      numero += Math.floor(Math.random() * 10);
    }

    return numero;
  }


  // ==============================
  // 🔐 GERAR CVV 3 DIGITOS
  // ==============================
  static gerarCVV() {

    return Math.floor(100 + Math.random() * 900).toString();

  }


  // ==============================
  // 💳 CRIAR CARTÃO
  // ==============================
  static async criarCartao({ contaId }) {

    const conta = await Conta.findOne({
      id_conta: contaId
    });

    if (!conta) {
      throw new Error('Conta não encontrada');
    }

    const numeroCartao = this.gerarNumeroCartao();
    const cvv = this.gerarCVV();

    const cartao = await Cartao.create({

      conta_id: contaId,
      numero_cartao: numeroCartao,
      validade: '12/32',
      cvv_hash: cvv,
      tipo: 'MULTIPLO',
      bandeira: 'VISA',
      limite_credito: 1000,
      limite_utilizado: 0

    });

    return cartao;
  }


  // ==============================
  // 🔍 BUSCAR CARTÃO POR ID
  // ==============================
  static async buscarCartao(id) {

    const cartao = await Cartao.findOne({
      id_cartao: id
    });

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    return cartao;
  }


  // ==============================
  // 📄 LISTAR POR CONTA
  // ==============================
  static async listarPorConta(contaId) {

    return Cartao.find({
      conta_id: contaId
    });

  }


  // ==============================
  // 🔒 BLOQUEAR
  // ==============================
  static async bloquearCartao(id) {

    const cartao = await Cartao.findOne({
      id_cartao: id
    });

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    cartao.status_cartao = 'BLOQUEADO';
    cartao.data_bloqueio = new Date();

    await cartao.save();

    return cartao;
  }


  // ==============================
  // 🔓 DESBLOQUEAR
  // ==============================
  static async desbloquearCartao(id) {

    const cartao = await Cartao.findOne({
      id_cartao: id
    });

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    cartao.status_cartao = 'ATIVO';
    cartao.data_bloqueio = null;

    await cartao.save();

    return cartao;
  }


  // ==============================
  // 💰 ALTERAR LIMITE
  // ==============================
  static async alterarLimite(id, novoLimite) {

    const cartao = await Cartao.findOne({
      id_cartao: id
    });

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    cartao.limite_credito = novoLimite;

    await cartao.save();

    return cartao;
  }


  // ==============================
  // 📊 CONSULTAR LIMITE
  // ==============================
  static async consultarLimite(id) {

    const cartao = await Cartao.findOne({
      id_cartao: id
    });

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    return {
      limite_total: cartao.limite_credito,
      limite_utilizado: cartao.limite_utilizado,
      limite_disponivel:
        cartao.limite_credito - cartao.limite_utilizado
    };
  }

}
