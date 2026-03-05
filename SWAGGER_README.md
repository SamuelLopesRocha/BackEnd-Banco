# 📚 Documentação Swagger - API Banco App

## Como Acessar a Documentação

Após iniciar o servidor, acesse a documentação em:

```
http://localhost:8000/api-docs
```

## Iniciando o Servidor

```bash
cd "c:\Users\marco\OneDrive\Área de Trabalho\BackEnd-Banco"
node server.js
```

## O que foi Configurado

✅ **Swagger UI** - Interface interativa para explorar a API  
✅ **Swagger JSDoc** - Geração automática de documentação  
✅ **Autenticação JWT** - Endpoints protegidos com Bearer Token  
✅ **Todos os Endpoints Documentados**:

### 📋 Grupos de Endpoints

#### Usuários
- `POST /usuarios` - Criar novo usuário
- `GET /usuarios` - Listar todos os usuários
- `GET /usuarios/meus-dados` - Dados do usuário autenticado 🔒
- `GET /usuarios/{id}` - Obter usuário por ID
- `PUT /usuarios/{id}` - Atualizar usuário
- `DELETE /usuarios/{id}` - Deletar usuário

#### Autenticação
- `POST /auth/login` - Fazer login

#### Contas
- `POST /contas/poupanca` - Criar conta poupança
- `GET /contas/{usuario_id}` - Listar contas do usuário

#### Transações 🔒
- `POST /transacoes/deposito` - Realizar depósito
- `POST /transacoes/saque` - Realizar saque
- `POST /transacoes/pix` - Transferência PIX
- `GET /transacoes` - Listar minhas transações

#### Cartões 🔒
- `POST /cartoes` - Criar novo cartão
- `GET /cartoes/meus` - Listar meus cartões
- `GET /cartoes/{id}` - Obter cartão por ID
- `PATCH /cartoes/{id}/bloquear` - Bloquear cartão
- `PATCH /cartoes/{id}/desbloquear` - Desbloquear cartão
- `PATCH /cartoes/{id}/limite` - Alterar limite
- `GET /cartoes/{id}/limite` - Consultar limite
- `DELETE /cartoes/{id}` - Deletar cartão

#### Compras com Cartão 🔒
- `POST /compras-cartao` - Realizar compra
- `GET /compras-cartao` - Listar minhas compras
- `GET /compras-cartao/{id}` - Obter compra por ID
- `PATCH /compras-cartao/{id}/cancelar` - Cancelar compra

#### Faturas
- `POST /faturas` - Criar fatura
- `GET /faturas/cartao/{cartao_id}` - Listar faturas por cartão
- `GET /faturas/{id}` - Buscar fatura por ID
- `PATCH /faturas/{id}/fechar` - Fechar fatura
- `PATCH /faturas/{id}/pagar` - Pagar fatura

#### Chaves PIX 🔒
- `POST /chaves-pix` - Cadastrar chave PIX
- `GET /chaves-pix` - Listar minhas chaves
- `DELETE /chaves-pix/{chave}` - Excluir chave PIX
- `GET /chaves-pix/consultar/{chave}` - Consultar origem da chave

🔒 = Requer autenticação com Bearer Token

## Testando Endpoints

No Swagger UI você pode:

1. **Clicar em um endpoint** para expandir
2. **Clicar em "Try it out"** para testar
3. **Preencher os parâmetros** e o corpo da requisição
4. **Clicar em "Execute"** para fazer a requisição

## Autenticação

Para endpoints protegidos (🔒):

1. Faça login primeiro em `POST /auth/login`
2. Copie o token recebido
3. Clique no botão **"Authorize"** no topo do Swagger UI
4. Cole o token no formato: `Bearer SEU_TOKEN_AQUI`
5. Clique em "Authorize"

## Schemas Disponíveis

A documentação inclui schemas para todos os tipos de dados:

- **Usuario** - Dados do usuário
- **Conta** - Dados da conta bancária
- **Cartao** - Dados do cartão
- **Transacao** - Dados da transação
- **Fatura** - Dados da fatura
- **ChavePix** - Dados da chave PIX
- **CompraCartao** - Dados da compra com cartão
- **Error** - Formato de erro

## Próximos Passos

Para manter a documentação atualizada:

1. Modifique os endpoints nas suas rotas
2. Atualize a documentação em `src/config/swagger-paths.js`
3. Reinicie o servidor
4. A documentação será atualizada automaticamente!

---

**Desenvolvido com ❤️ para o Banco App**
