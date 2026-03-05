import { Usuario } from '../models/usuario_model.js';
import bcrypt from 'bcryptjs';
import { Conta } from '../models/conta_model.js';
import { ChavePix } from '../models/chave_pix_model.js'; 
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);



// 🧠 UTILIDADES
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

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function calcularIdade(data) {
  const nascimento = new Date(data);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
}

// GERAR NÚMERO DA CONTA
function gerarNumeroConta() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GERAR DÍGITO SIMPLES
function gerarDigito(numero) {
  const soma = numero.split('').reduce((acc, n) => acc + parseInt(n), 0);
  return (soma % 10).toString();
}

// CREATE
export const createUsuario = async (req, res) => {
  try {
    let {
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
      senha
    } = req.body;

    // 📌 Campos obrigatórios
    if (!nome_completo || !cpf || !data_nascimento || !email || !telefone || !cidade || !estado || !cep || !numero || !senha) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // ✂️ Sanitização
    nome_completo = nome_completo.trim();
    cpf = cpf.trim();
    email = email.trim().toLowerCase();
    telefone = telefone.trim();
    cidade = cidade.trim();
    estado = estado.trim().toUpperCase();
    cep = cep.trim();
    numero = numero.trim();
    complemento = complemento?.trim() || null;

    // 🛑 Nome válido
    if (nome_completo.length < 5) {
      return res.status(400).json({ error: 'Nome completo inválido.' });
    }

    // 🛑 CPF válido
    if (!validarCPF(cpf)) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

    // 🛑 Email válido
    if (!validarEmail(email)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }

    // 🛑 Idade mínima
    if (calcularIdade(data_nascimento) < 18) {
      return res.status(400).json({ error: 'Usuário deve ter no mínimo 18 anos.' });
    }

    // 🔐 Senha válida
    if (senha.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
    }

    // 🚫 CPF duplicado
    if (await Usuario.findOne({ cpf })) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }

    // 🚫 Email duplicado
    if (await Usuario.findOne({ email })) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    // 🔐 Criptografar senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 🔢 ID sequencial
    const ultimo = await Usuario.findOne().sort({ usuario_id: -1 });
    const proximoId = ultimo ? ultimo.usuario_id + 1 : 1;

    // � Gerar token de verificação de e-mail
    const token = crypto.randomUUID();

    // 💾 Criar usuário
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
      status_conta: 'PENDENTE',
      email_enviado: false,
      token_verificacao: token // 🔑 salvo no usuário para o RPA encontrar
    });

    // 🔎 Criar conta corrente automaticamente
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

    const usuarioLimpo = novoUsuario.toObject();
    delete usuarioLimpo.senha;

    try {
      console.log("Iniciando RPA de envio de e-mail...");
      
      const caminhoRPA = path.join(process.cwd(), 'src', 'rpa', 'main.py');
      
      // Executa o Python e espera ele terminar
      const { stdout } = await execAsync(`python  "${caminhoRPA}"`);
      
      console.log("RPA finalizado:\n", stdout);

      // RPA enviou o email, avisa o front-end!
      return res.status(201).json({
        message: 'Usuário criado com sucesso e e-mail enviado para a sua caixa de entrada!',
        usuario: usuarioLimpo
      });

    } catch (erroRpa) {
      console.error("Erro ao rodar o RPA:", erroRpa);
      // Se o Python falhar (ex: sem internet), o usuário continua salvo no banco!
      return res.status(201).json({
        message: 'Usuário criado com sucesso! O e-mail de confirmação chegará em alguns minutos.',
        usuario: usuarioLimpo
      });
    }

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
};


// LIST
export async function listUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find({ status_conta: { $ne: 'EXCLUIDA' } })
      .sort({ createdAt: -1 });

    res.json(usuarios);
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
}

// GET BY ID
export async function getUsuarioById(req, res) {
  try {
    const usuario = await Usuario.findOne({ usuario_id: req.params.id });

    if (!usuario || usuario.status_conta === 'EXCLUIDA') {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
}

// VERIFICAR EMAIL
export async function verificarEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token não informado.' });
    }

    const usuario = await Usuario.findOneAndUpdate(
      { token_verificacao: token },
      { status_conta: 'ATIVA', email_verificado: true, token_verificacao: null },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Token inválido ou já utilizado.' });
    }

    return res.status(200).json({ message: 'E-mail verificado com sucesso! A conta está ativa!' });
  } catch (err) {
    console.error('Erro ao verificar e-mail:', err);
    return res.status(500).json({ error: 'Erro interno ao verificar e-mail.' });
  }
}

// UPDATE
export async function updateUsuario(req, res) {
  try {
    const usuarioAntes = await Usuario.findOne({ usuario_id: req.params.id });

    if (!usuarioAntes) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (usuarioAntes.status_conta === 'EXCLUIDA') {
      return res.status(400).json({ error: 'Conta desativada. Atualização bloqueada.' });
    }

    const update = {};

    // 📝 Nome
    if (req.body.nome_completo) {
      const nome = req.body.nome_completo.trim();
      if (nome.length < 5) return res.status(400).json({ error: 'Nome inválido.' });
      update.nome_completo = nome;
    }

    // 🎂 Data nascimento
    if (req.body.data_nascimento) {
      if (calcularIdade(req.body.data_nascimento) < 18) {
        return res.status(400).json({ error: 'Idade mínima 18 anos.' });
      }
      update.data_nascimento = req.body.data_nascimento;
    }

    // 🔐 Atualizar senha
    if (req.body.senha) {
        if (req.body.senha.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres.' });
    }

    const salt = await bcrypt.genSalt(10);
    update.senha = await bcrypt.hash(req.body.senha, salt);
}


    // 📞 Outros campos
    if (req.body.telefone) update.telefone = req.body.telefone.trim();
    if (req.body.cidade) update.cidade = req.body.cidade.trim();
    if (req.body.estado) update.estado = req.body.estado.trim().toUpperCase();
    if (req.body.cep) update.cep = req.body.cep.trim();
    if (req.body.numero) update.numero = req.body.numero.trim();
    if (req.body.complemento !== undefined) update.complemento = req.body.complemento?.trim() || null;

    // 🚫 CPF
    if (req.body.cpf) {
      const cpf = req.body.cpf.trim();
      if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

      const existente = await Usuario.findOne({ cpf });
      if (existente && existente.usuario_id !== usuarioAntes.usuario_id) {
        return res.status(400).json({ error: 'CPF já em uso.' });
      }
      update.cpf = cpf;
    }

    // 🚫 EMAIL
    if (req.body.email) {
      const email = req.body.email.trim().toLowerCase();
      if (!validarEmail(email)) return res.status(400).json({ error: 'E-mail inválido.' });

      const existente = await Usuario.findOne({ email });
      if (existente && existente.usuario_id !== usuarioAntes.usuario_id) {
        return res.status(400).json({ error: 'E-mail já em uso.' });
      }
      update.email = email;
    }

    // ⚠️ STATUS
    if (req.body.status_conta) {
      const permitido = ['ATIVA', 'BLOQUEADA', 'ENCERRADA'];
      if (!permitido.includes(req.body.status_conta)) {
        return res.status(400).json({ error: 'Status inválido.' });
      }
      update.status_conta = req.body.status_conta;
    }

    const usuarioAtualizado = await Usuario.findOneAndUpdate(
      { usuario_id: req.params.id },
      update,
      { new: true }
    );

    res.json({
      message: 'Usuário atualizado com sucesso.',
      usuario: usuarioAtualizado
    });

  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
}

// DELETE → SOFT DELETE
export async function deleteUsuario(req, res) {
  try {
    const usuario = await Usuario.findOne({ usuario_id: req.params.id });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (usuario.status_conta === 'EXCLUIDA') {
      return res.status(400).json({ error: 'Usuário já excluído.' });
    }

    usuario.status_conta = 'EXCLUIDA';
    await usuario.save();

    res.json({ message: 'Usuário desativado com sucesso.' });

  } catch (err) {
    console.error('Erro ao excluir usuário:', err);
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
}


export const getMeusDados = async (req, res) => {
  try {
    const idDoUsuario = req.user.usuario_id;

    // 1. BUSCA O USUÁRIO
    const usuario = await Usuario.findOne({ usuario_id: idDoUsuario }).select('-senha');

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // 2. BUSCA A CONTA (Para pegar o saldo)
    const conta = await Conta.findOne({ usuario_id: idDoUsuario });

    // 3. BUSCA AS CHAVES PIX DO USUÁRIO 🔥
    const chavesDoUsuario = await ChavePix.find({ usuario_id: idDoUsuario });
    
    // Extrai apenas os nomes das chaves para uma lista (ex: ['focas@email.com', '11999999999'])
    const listaChavesPix = chavesDoUsuario.map(c => c.chave);

    // 4. PREPARA A RESPOSTA
    const respostaCompleta = {
      ...usuario.toObject(),
      saldo_disponivel: conta ? conta.saldo : 0,
      saldo_poupanca: 0,
      tipo_conta: conta ? conta.tipo_conta : 'CORRENTE',
      numero_conta: conta ? conta.numero_conta : null, // Deixamos escondido aqui para o sistema usar depois
      chaves_pix: listaChavesPix // 🔥 Passando as Chaves Pix para o Front-end!
    };

    res.status(200).json(respostaCompleta);
  } catch (error) {
    console.error("Erro ao buscar dados do usuário logado:", error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
};