import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http'; // 👈 Importado do Node
import { Server } from 'socket.io'; // 👈 Importado do Socket.io

import { connectDatabase } from './src/config/db.js';
import usuarioRoutes from "./src/routes/usuario_route.js";
import loginRoutes from "./src/routes/login_route.js";
import contaRoutes from './src/routes/conta_routes.js';
import transacaoRoutes from './src/routes/transacao_routes.js';
import cartaoRoutes from './src/routes/cartao_route.js';
import compraCartaoRoutes from './src/routes/compra_cartao_route.js';
import faturaRoutes from './src/routes/fatura_route.js';
import chavePixRoutes from './src/routes/chave_pix_route.js';
import cobrancaRoutes from './src/routes/cobranca_routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // 👈 Cria o servidor HTTP envolvendo o Express

// 🔌 Configurando o Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Permite que o Front-end conecte de qualquer porta
    methods: ["GET", "POST"]
  }
});

// 📡 Ouvindo as conexões dos usuários
io.on('connection', (socket) => {
  console.log(`🟢 Dispositivo conectado no Socket: ${socket.id}`);

  // O Front-end vai avisar quem ele é, e nós o colocamos em uma "sala VIP" com o ID dele
  socket.on('entrarNaConta', (usuario_id) => {
    socket.join(String(usuario_id));
    console.log(`🏠 Usuário ${usuario_id} entrou na sala de notificações.`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Dispositivo desconectado: ${socket.id}`);
  });
});

// 💉 Middleware de Injeção: Coloca o "io" disponível em TODAS as rotas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔌 Conectar ao banco
connectDatabase();

// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// 📌 Rotas
app.use('/usuarios', usuarioRoutes);
app.use("/auth", loginRoutes);
app.use('/contas', contaRoutes);
app.use('/transacoes', transacaoRoutes);
app.use('/cartoes', cartaoRoutes);
app.use('/compras-cartao', compraCartaoRoutes);
app.use('/faturas', faturaRoutes);
app.use('/chaves-pix', chavePixRoutes);
app.use('/cobrancas', cobrancaRoutes);

// 🧪 Rota teste
app.get('/', (req, res) => {
  res.json({ message: 'API Banco App rodando 🚀' });
});

// 🚀 Servidor (Usando o server.listen no lugar do app.listen)
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});