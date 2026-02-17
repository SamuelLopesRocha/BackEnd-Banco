/*
pwd
cd ..
node server.js
*/

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDatabase } from './src/config/db.js';
import usuarioRoutes from "./src/routes/usuario_route.js";
import loginRoutes from "./src/routes/login_route.js";
import contaRoutes from './src/routes/conta_routes.js';
import transacaoRoutes from './src/routes/transacao_routes.js';
import cartaoRoutes from './src/routes/cartao_route.js';
import compraCartaoRoutes from './src/routes/compracartao_route.js';
import faturaRoutes from './src/routes/fatura_route.js';


dotenv.config();

const app = express();

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

// 🧪 Rota teste
app.get('/', (req, res) => {
  res.json({ message: 'API Banco App rodando 🚀' });
});

// 🚀 Servidor
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});