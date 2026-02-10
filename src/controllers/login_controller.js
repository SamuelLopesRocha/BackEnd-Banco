import { Usuario } from "../models/cadastro_model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function loginUser(req, res) {
  try {
    let { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ error: "Login e senha são obrigatórios." });
    }

    login = login.trim().toLowerCase();

    // Buscar por CPF ou Email
    const usuario = await Usuario.findOne({
      $or: [{ email: login }, { cpf: login }]
    }).select("+senha");

    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    if (usuario.status_conta !== "ATIVA") {
      return res.status(403).json({ error: "Conta não está ativa." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Senha inválida." });
    }

    // 🔐 Gerar token JWT
    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "2h" }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token,
      usuario: {
        usuario_id: usuario.usuario_id,
        nome_completo: usuario.nome_completo,
        cpf: usuario.cpf,
        email: usuario.email,
        status_conta: usuario.status_conta
      }
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no login." });
  }
}
