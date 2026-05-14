import mongoose from 'mongoose';
import { Cartao } from '../models/cartao_model.js';
import { Conta } from '../models/conta_model.js';

export class CartaoService {

  // ======================================
  // VALIDAR OBJECTID
  // ======================================
  static validarObjectId(id) {
    const idNormalizado = String(id || '').trim();

    if (!mongoose.Types.ObjectId.isValid(idNormalizado)) {
      throw new Error('ID do cartao invalido');
    }

    const objectId = new mongoose.Types.ObjectId(idNormalizado);

    if (objectId.toString() !== idNormalizado.toLowerCase()) {
      throw new Error('ID do cartao invalido');
    }

    return idNormalizado;
  }


  // ======================================
  // BUSCAR CARTAO POR OBJECTID
  // ======================================
  static async buscarPorObjectId(id) {
    const objectId = this.validarObjectId(id);

    const cartao = await Cartao.findById(objectId);

    if (!cartao) {
      throw new Error('Cartao nao encontrado');
    }

    return cartao;
  }


  // ======================================
  // CRIAR CARTAO PARA USUARIO LOGADO
  // ======================================
  static async criarCartao(usuario_id) {

    const conta = await Conta.findOne({ usuario_id });

    if (!conta) {
      throw new Error('Conta nao encontrada para o usuario');
    }

    if (conta.status_conta !== 'ATIVA') {
      throw new Error('Conta do usuario nao esta ativa');
    }

    const cartao = await Cartao.create({
      usuario_id,
      conta_id: conta.id_conta,
      tipo: 'MULTIPLO',
      bandeira: 'VISA',
      status_cartao: 'ATIVO',
      limite_total: 1000,
      limite_usado: 0
    });

    return cartao;
  }


  // ======================================
  // BUSCAR CARTAO POR ID
  // ======================================
  static async buscarCartao(id) {
    return this.buscarPorObjectId(id);
  }


  // ======================================
  // LISTAR CARTOES DO USUARIO
  // ======================================
  static async listarMeusCartoes(usuario_id) {
    return await Cartao.find({ usuario_id });
  }


  // ======================================
  // BLOQUEAR CARTAO
  // ======================================
  static async bloquearCartao(id) {

    const cartao = await this.buscarPorObjectId(id);

    if (cartao.status_cartao === 'BLOQUEADO') {
      throw new Error('Cartao ja esta bloqueado');
    }

    cartao.status_cartao = 'BLOQUEADO';
    cartao.data_bloqueio = new Date();

    await cartao.save();

    return cartao;
  }


  // ======================================
  // DESBLOQUEAR CARTAO
  // ======================================
  static async desbloquearCartao(id) {

    const cartao = await this.buscarPorObjectId(id);

    if (cartao.status_cartao === 'ATIVO') {
      throw new Error('Cartao ja esta ativo');
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

    const cartao = await this.buscarPorObjectId(id);
    const limite = Number(novoLimite);
    const limiteUsado = Number(cartao.limite_usado || 0);

    if (!Number.isFinite(limite) || limite <= 0) {
      throw new Error('Novo limite invalido');
    }

    if (limite < limiteUsado) {
      throw new Error('Novo limite nao pode ser menor que o limite ja utilizado');
    }

    cartao.limite_total = limite;

    await cartao.save();
    return cartao;
  }


  // ======================================
  // CONSULTAR LIMITE
  // ======================================
  static async consultarLimite(id) {

    const cartao = await this.buscarPorObjectId(id);
    const limiteTotal = Number(cartao.limite_total || 0);
    const limiteUsado = Number(cartao.limite_usado || 0);

    return {
      limite_total: limiteTotal,
      limite_usado: limiteUsado,
      limite_disponivel: limiteTotal - limiteUsado
    };
  }


  // ======================================
  // DELETAR CARTAO
  // ======================================
  static async deletarCartao(id) {

    const cartao = await this.buscarPorObjectId(id);

    await cartao.deleteOne();

    return {
      mensagem: 'Cartao deletado com sucesso'
    };
  }

}
