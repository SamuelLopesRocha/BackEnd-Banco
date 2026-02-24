import { Cartao } from '../models/cartao_model.js';
import { Conta } from '../models/conta_model.js';

export class CartaoService {

  // ======================================
  // CRIAR CARTÃO PARA USUÁRIO LOGADO
  // ======================================
  static async criarCartao(usuario_id) {

    const conta = await Conta.findOne({ usuario_id });

    if (!conta) {
      throw new Error('Conta não encontrada para o usuário');
    }

    const cartao = await Cartao.create({
      usuario_id,
      conta_id: conta.numero_conta,
      tipo: 'MULTIPLO',
      bandeira: 'VISA',
      status_cartao: 'ATIVO',
      limite_total: 1000,
      limite_usado: 0
    });

    return cartao;
  }


  // ======================================
  // BUSCAR CARTÃO POR ID
  // ======================================
  static async buscarCartao(id) {

    const cartao = await Cartao.findById(id);

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    return cartao;
  }


  // ======================================
  // LISTAR CARTÕES DO USUÁRIO
  // ======================================
  static async listarMeusCartoes(usuario_id) {

    return await Cartao.find({ usuario_id });

  }


  // ======================================
  // BLOQUEAR CARTÃO
  // ======================================
  static async bloquearCartao(id) {

    const cartao = await Cartao.findById(id);

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    if (cartao.status_cartao === 'BLOQUEADO') {
      throw new Error('Cartão já está bloqueado');
    }

    cartao.status_cartao = 'BLOQUEADO';
    cartao.data_bloqueio = new Date();

    await cartao.save();

    return cartao;
  }


  // ======================================
  // DESBLOQUEAR CARTÃO
  // ======================================
  static async desbloquearCartao(id) {

    const cartao = await Cartao.findById(id);

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    if (cartao.status_cartao === 'ATIVO') {
      throw new Error('Cartão já está ativo');
    }

    cartao.status_cartao = 'ATIVO';
    cartao.data_bloqueio = null;

    await cartao.save();

    return cartao;
  }


  // ======================================
  // ALTERAR LIMITE
  // ======================================
  static async alterarLimite(id, novoLimite) {

    const cartao = await Cartao.findById(id);

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    const limite = Number(novoLimite);

    if (!Number.isFinite(limite) || limite <= 0) {
      throw new Error('Novo Limite inválido');
    }

    if (limite < cartao.limite_usado) {
      throw new Error('Novo limite não pode ser menor que o limite já utilizado');
    }

    cartao.limite_total = limite;

    await cartao.save();
    return cartao;
    }

  // ======================================
  // CONSULTAR LIMITE
  // ======================================
  static async consultarLimite(id) {

    const cartao = await Cartao.findById(id);

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    return {
      limite_total: cartao.limite_total,
      limite_usado: cartao.limite_usado,
      limite_disponivel: cartao.limite_total - cartao.limite_usado
    };
  }


  // ======================================
  // DELETAR CARTÃO
  // ======================================
  static async deletarCartao(id) {

    const cartao = await Cartao.findById(id);

    if (!cartao) {
      throw new Error('Cartão não encontrado');
    }

    await Cartao.deleteOne({ _id: id });

    return {
      mensagem: 'Cartão deletado com sucesso'
    };
  }

}