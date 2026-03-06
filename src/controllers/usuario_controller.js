import { Usuario } from '../models/usuario_model.js';
import bcrypt from 'bcryptjs';
import { Conta } from '../models/conta_model.js';
import { ChavePix } from '../models/chave_pix_model.js'; 

// 🧠 UTILIDADES MANTIDAS
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === parseInt(cpf.substring(10, 11));
}

function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function calcularIdade(data) {
  const nascimento = new Date(data); const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}
function gerarNumeroConta() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function gerarDigito(numero) { return (numero.split('').reduce((acc, n) => acc + parseInt(n), 0) % 10).toString(); }
function gerarCodigoVerificacao() { return Math.floor(100000 + Math.random() * 900000).toString(); }

// ===================================
// CREATE
// ===================================
export const createUsuario = async (req, res) => {
  try {
    let { nome_completo, cpf, data_nascimento, email, telefone, cidade, estado, cep, numero, complemento, senha } = req.body;

    if (!nome_completo || !cpf || !data_nascimento || !email || !telefone || !cidade || !estado || !cep || !numero || !senha) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    nome_completo = nome_completo.trim(); cpf = cpf.trim(); email = email.trim().toLowerCase();
    telefone = telefone.trim(); cidade = cidade.trim(); estado = estado.trim().toUpperCase();
    cep = cep.trim(); numero = numero.trim(); complemento = complemento?.trim() || null;

    if (nome_completo.length < 5) return res.status(400).json({ error: 'Nome completo inválido.' });
    if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });
    if (!validarEmail(email)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (calcularIdade(data_nascimento) < 18) return res.status(400).json({ error: 'Usuário deve ter no mínimo 18 anos.' });
    if (senha.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
    if (await Usuario.findOne({ cpf })) return res.status(400).json({ error: 'CPF já cadastrado.' });
    if (await Usuario.findOne({ email })) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const ultimo = await Usuario.findOne().sort({ usuario_id: -1 });
    const proximoId = ultimo ? ultimo.usuario_id + 1 : 1;

    const codigo = gerarCodigoVerificacao();

    const novoUsuario = await Usuario.create({
      usuario_id: proximoId,
      nome_completo,
      cpf,
      data_nascimento,
      email,
      telefone,
      cidade,
      estado,
      cep,
      numero,
      complemento,
      senha: senhaHash,
      status_conta: 'INATIVA',
      codigo_verificacao: codigo,
      codigo_expira: Date.now() + 10 * 60 * 1000, // Expira em 10 min
      email_enviado: false
    });

    const numeroConta = gerarNumeroConta();
    const digito = gerarDigito(numeroConta);

    await Conta.create({
      usuario_id: novoUsuario.usuario_id,
      agencia: '0001',
      numero_conta: numeroConta,
      digito: digito,
      tipo_conta: 'CORRENTE',
      saldo: 0,
      limite_credito: 200,
      limite_utilizado: 0,
      taxa_manutencao: 0,
      permite_cheque_especial: true
    });

    // Removido o Fetch. O Node apenas finaliza com sucesso. O RPA em Python caçará este novo usuário em breve.
    return res.status(201).json({
      message: 'Usuário criado com sucesso! O código de ativação chegará no seu e-mail em instantes.'
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
};

// ===================================
// VERIFICAR CÓDIGO
// ===================================
export const verificarCodigo = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    const usuario = await Usuario.findOne({ email });

    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });
    if (usuario.codigo_verificacao !== codigo) return res.status(400).json({ error: "Código inválido." });
    if (usuario.codigo_expira && usuario.codigo_expira.getTime() < Date.now()) {
      return res.status(400).json({ error: "Código expirado." });
    }

    usuario.email_verificado = true;
    usuario.status_conta = "ATIVA";
    usuario.codigo_verificacao = null; // Limpa o código usado

    await usuario.save();

    res.json({ message: "Conta verificada com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao verificar código." });
  }
};

// ===================================
// REENVIAR CÓDIGO
// ===================================
export const reenviarCodigo = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório." });

    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });
    if (usuario.email_verificado) return res.status(400).json({ error: "Esta conta já foi verificada." });

    const novoCodigo = gerarCodigoVerificacao();

    usuario.codigo_verificacao = novoCodigo;
    usuario.codigo_expira = Date.now() + 10 * 60 * 1000;

    await usuario.save();

    return res.json({ message: "Novo código gerado. O e-mail chegará em instantes." });

  } catch (error) {
    console.error("Erro ao reenviar código:", error);
    res.status(500).json({ error: "Erro interno ao reenviar código." });
  }
};

// MÉTODOS MANTIDOS DE LIST, GET, UPDATE, DELETE E DADOS
export async function listUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find({ status_conta: { $ne: 'EXCLUIDA' } }).sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (err) { res.status(500).json({ error: 'Erro ao listar usuários.' }); }
}

export async function getUsuarioById(req, res) {
  try {
    const usuario = await Usuario.findOne({ usuario_id: req.params.id });
    if (!usuario || usuario.status_conta === 'EXCLUIDA') return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(usuario);
  } catch (err) { res.status(500).json({ error: 'Erro ao buscar usuário.' }); }
}

export async function updateUsuario(req, res) {
  try {
    const usuarioAntes = await Usuario.findOne({ usuario_id: req.params.id });
    if (!usuarioAntes) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (usuarioAntes.status_conta === 'EXCLUIDA') return res.status(400).json({ error: 'Conta desativada.' });

    const update = {};

    if (req.body.nome_completo) {
      const nome = req.body.nome_completo.trim();
      if (nome.length < 5) return res.status(400).json({ error: 'Nome inválido.' });
      update.nome_completo = nome;
    }

    if (req.body.senha) {
      if (req.body.senha.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
      const salt = await bcrypt.genSalt(10);
      update.senha = await bcrypt.hash(req.body.senha, salt);
    }

    if (req.body.telefone) update.telefone = req.body.telefone.trim();
    if (req.body.cidade) update.cidade = req.body.cidade.trim();
    if (req.body.estado) update.estado = req.body.estado.trim().toUpperCase();
    if (req.body.cep) update.cep = req.body.cep.trim();
    if (req.body.numero) update.numero = req.body.numero.trim();

    const usuarioAtualizado = await Usuario.findOneAndUpdate({ usuario_id: req.params.id }, update, { new: true });
    res.json({ message: 'Usuário atualizado com sucesso.', usuario: usuarioAtualizado });
  } catch (err) { res.status(500).json({ error: 'Erro ao atualizar usuário.' }); }
}

export async function deleteUsuario(req, res) {
  try {
    const usuario = await Usuario.findOne({ usuario_id: req.params.id });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    usuario.status_conta = 'EXCLUIDA';
    await usuario.save();
    res.json({ message: 'Usuário desativado com sucesso.' });
  } catch (err) { res.status(500).json({ error: 'Erro ao excluir usuário.' }); }
}

export const getMeusDados = async (req, res) => {
  try {
    const idDoUsuario = req.user.usuario_id;
    const usuario = await Usuario.findOne({ usuario_id: idDoUsuario }).select('-senha');
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const conta = await Conta.findOne({ usuario_id: idDoUsuario });
    const chavesDoUsuario = await ChavePix.find({ usuario_id: idDoUsuario });
    const listaChavesPix = chavesDoUsuario.map(c => c.chave);

    const respostaCompleta = {
      ...usuario.toObject(),
      saldo_disponivel: conta ? conta.saldo : 0,
      saldo_poupanca: 0,
      tipo_conta: conta ? conta.tipo_conta : 'CORRENTE',
      numero_conta: conta ? conta.numero_conta : null,
      chaves_pix: listaChavesPix
    };

    res.status(200).json(respostaCompleta);
  } catch (error) { res.status(500).json({ error: 'Erro interno no servidor.' }); }
};