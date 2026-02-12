import { Conta } from '../models/conta_model.js';
import { Usuario } from '../models/cadastro_model.js';


// 🔢 UTILIDADES
function gerarNumeroConta() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function gerarDigito(numero) {
  const soma = numero.split('').reduce((acc, n) => acc + parseInt(n), 0);
  return (soma % 10).toString();
}


// 🟣 POST - Criar Conta Poupança
export const criarContaPoupanca = async (req, res) => {
  try {
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id é obrigatório.' });
    }

    // 🔎 Verifica se usuário existe e está ativo
    const usuario = await Usuario.findOne({ usuario_id });

    if (!usuario || usuario.status_conta !== 'ATIVA') {
      return res.status(404).json({ error: 'Usuário inválido ou inativo.' });
    }

    // 🚫 Verifica duplicidade (extra segurança além do index)
    const jaExiste = await Conta.findOne({
      usuario_id,
      tipo_conta: 'POUPANCA'
    });

    if (jaExiste) {
      return res.status(400).json({
        error: 'Usuário já possui conta poupança.'
      });
    }

    const numeroConta = gerarNumeroConta();
    const digito = gerarDigito(numeroConta);

    const novaConta = await Conta.create({
      usuario_id,
      agencia: '0001',
      numero_conta: numeroConta,
      digito,
      tipo_conta: 'POUPANCA',
      saldo: 0,
      taxa_rendimento: 0.005,
      rendimento_acumulado: 0,
      aniversario_poupanca: new Date().getDate()
    });

    return res.status(201).json({
      message: 'Conta poupança criada com sucesso.',
      conta: novaConta
    });

  } catch (err) {
    console.error('Erro ao criar conta poupança:', err);
    return res.status(500).json({
      error: 'Erro ao criar conta poupança.'
    });
  }
};


// 🔵 GET - Listar Contas do Usuário
export const listarContasDoUsuario = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const usuario = await Usuario.findOne({ usuario_id });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuário não encontrado.'
      });
    }

    const contas = await Conta.find({
      usuario_id,
      status_conta: { $ne: 'ENCERRADA' }
    });

    return res.json({
      usuario_id,
      total_contas: contas.length,
      contas
    });

  } catch (err) {
    console.error('Erro ao listar contas:', err);
    return res.status(500).json({
      error: 'Erro ao listar contas.'
    });
  }
};
