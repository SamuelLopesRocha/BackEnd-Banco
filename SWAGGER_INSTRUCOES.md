#!/bin/bash
# INÍCIO RÁPIDO - Documentação Swagger

## 🚀 PASSO 1: Iniciar o servidor

cd "c:\Users\marco\OneDrive\Área de Trabalho\BackEnd-Banco"
node server.js

# SAÍDA ESPERADA:
# ✅ Servidor rodando em http://localhost:8000


## 🌐 PASSO 2: Abrir no navegador

# Acesse a documentação Swagger em:
http://localhost:8000/api-docs


## 🔑 PASSO 3: Autenticar (Opcional)

# 1. Clique em "Try it out" em: POST /auth/login
# 2. Preencha com:
{
  "email": "seu_email@example.com",
  "senha": "sua_senha"
}
# 3. Copie o token retornado
# 4. Clique em "Authorize" (botão no topo)
# 5. Cole: Bearer SEU_TOKEN
# 6. Clique em "Authorize"


## ✅ PASSO 4: Testar um Endpoint

# 1. Expanda qualquer endpoint (ex: GET /usuarios)
# 2. Clique em "Try it out"
# 3. Preencha os parâmetros se necessário
# 4. Clique em "Execute"
# 5. Veja a resposta abaixo


## 📚 DOCUMENTOS DE REFERÊNCIA

# Guia Rápido:        SWAGGER_README.md
# Guia Completo:      GUIA_SWAGGER.md
# Exemplos:           EXEMPLOS_REQUISICOES.json
# Resumo:             RESUMO_SWAGGER.md


## 🔗 LINKS IMPORTANTES

# Documentação Swagger:    http://localhost:8000/api-docs
# API Health Check:        http://localhost:8000/
# Base URL:                http://localhost:8000


## 🎯 ENDPOINTS PRINCIPAIS

# Criar Usuário:           POST /usuarios
# Fazer Login:             POST /auth/login
# Criar Cartão:            POST /cartoes (requer auth)
# Realizar Transação:      POST /transacoes/deposito (requer auth)
# Listar Minhas Contas:    GET /contas/{usuario_id}


## 🐛 TROUBLESHOOTING

# Swagger não aparece?
  - Verificar se o servidor está rodando
  - Revisitar: http://localhost:8000/api-docs
  - Limpar cache (Ctrl+F5)
  - Verificar console (F12) para erros

# Erro ao conectar ao banco?
  - Verificar conexão com MongoDB
  - Verificar .env com PORT e DB_URL
  - Ver logs do servidor

# Autenticação não funciona?
  - Usar token do login correto
  - Verificar formato: "Bearer TOKEN"
  - Testar em outro endpoint


## 💡 DICAS

1. Use o Swagger UI para testar toda a API
2. Os exemplos em cada endpoint ajudam
3. Veja EXEMPLOS_REQUISICOES.json para referência
4. Atualize documentação ao adicionar endpoints
5. Tokens JWT expiram, refaça login se necessário


## 🎓 ESTRUTURA DOS 34 ENDPOINTS

Usuários:             6 endpoints
Autenticação:         1 endpoint
Contas:               2 endpoints
Transações:           4 endpoints (4 protegidos)
Cartões:              8 endpoints (8 protegidos)
Compras com Cartão:   4 endpoints (4 protegidos)
Faturas:              5 endpoints
Chaves PIX:           4 endpoints (4 protegidos)


## ✨ O QUE ESTÁ PRONTO

✅ Swagger UI instalado e configurado
✅ 34 endpoints documentados
✅ Autenticação JWT integrada
✅ Schemas de todos os modelos
✅ Exemplos de valores
✅ Guias de manutenção
✅ Exemplos de requisições

---

**Ready to go! 🚀**

Inicie agora com: node server.js
Acesse em: http://localhost:8000/api-docs
