import { ChavePix } from '../models/chave_pix_model.js';
import { Conta } from '../models/conta_model.js';
import { Usuario } from '../models/usuario_model.js';

export class ChavePixController {

  // ======================================
  // CADASTRAR NOVA CHAVE PIX
  // ======================================
  static async cadastrar(req, res) {
    try {
      const { chave, tipo_chave } = req.body;
      const usuario_id = req.user.usuario_id;

      // 1. Verifica se a chave já existe no banco
      const chaveExistente = await ChavePix.findOne({ chave });
      if (chaveExistente) {
        return res.status(400).json({ error: 'Esta chave Pix já está em uso.' });
      }

      // 2. Busca a conta do usuário para vincular a chave a ela
      const conta = await Conta.findOne({ usuario_id });
      if (!conta) {
        return res.status(404).json({ error: 'Conta não encontrada para este usuário.' });
      }

      // 3. Salva a nova chave
      const novaChave = await ChavePix.create({
        chave,
        tipo_chave,
        numero_conta: conta.numero_conta,
        usuario_id
      });

      return res.status(201).json({
        message: 'Chave Pix cadastrada com sucesso!',
        chave: novaChave
      });

    } catch (error) {
      console.error("Erro ao cadastrar chave:", error);
      return res.status(500).json({ error: 'Erro interno ao cadastrar chave.' });
    }
  }

  // ======================================
  // LISTAR MINHAS CHAVES
  // ======================================
  static async listarMinhasChaves(req, res) {
    try {
      const usuario_id = req.user.usuario_id;
      const chaves = await ChavePix.find({ usuario_id });
      return res.status(200).json(chaves);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar chaves.' });
    }
  }

  // ======================================
  // EXCLUIR CHAVE PIX
  // ======================================
  static async excluir(req, res) {
    try {
      const { chave } = req.params;
      const usuario_id = req.user.usuario_id;

      // Garante que o usuário só pode excluir a PRÓPRIA chave
      const chaveDeletada = await ChavePix.findOneAndDelete({ chave, usuario_id });

      if (!chaveDeletada) {
        return res.status(404).json({ error: 'Chave não encontrada ou não pertence a você.' });
      }

      return res.status(200).json({ message: 'Chave Pix excluída com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir chave.' });
    }
  }

  // ======================================
  // CONSULTAR CHAVE (Para quem vai ENVIAR o Pix)
  // ======================================
  static async consultarOrigem(req, res) {
    try {
      const { chave } = req.params;

      const chavePix = await ChavePix.findOne({ chave });
      if (!chavePix) {
        return res.status(404).json({ error: 'Chave Pix não encontrada.' });
      }

      // Busca o nome do dono da chave para mostrar na tela de confirmação
      const usuarioDestino = await Usuario.findOne({ usuario_id: chavePix.usuario_id });

      return res.status(200).json({
        chave: chavePix.chave,
        numero_conta_destino: chavePix.numero_conta,
        nome_recebedor: usuarioDestino ? usuarioDestino.nome_completo : 'Usuário Desconhecido'
      });

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao consultar chave.' });
    }
  }
}