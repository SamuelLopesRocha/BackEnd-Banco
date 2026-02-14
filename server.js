/*
pwd
cd ..
node server.js
*/

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDatabase } from './src/config/db.js';
import cadastroRoutes from "./src/routes/cadastro_route.js";
import loginRoutes from "./src/routes/login_route.js";
import contaRoutes from './src/routes/conta_routes.js';



dotenv.config();

const app = express();

// 🔌 Conectar ao banco
connectDatabase();

// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// 📌 Rotas
app.use('/cadastros', cadastroRoutes);
app.use("/auth", loginRoutes);
app.use('/contas', contaRoutes);


// 🧪 Rota teste
app.get('/', (req, res) => {
  res.json({ message: 'API Banco App rodando 🚀' });
});

// 🚀 Servidor
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});