# Registro de Alterações — BackEnd Banco

Data: 04/03/2026

---

## 1. `src/config/swagger-paths.js` — Correções na documentação da API

### 1.1 `POST /compras-cartao`
**Problema:** campos documentados não correspondiam ao que a API realmente espera.

| Antes (errado) | Depois (correto) |
|---|---|
| `cartao_id` (string) | `numero_cartao` (string) |
| `valor` (number) | `cvv` (string) |
| `local` (string) | `valor_total` (number) |
| — | `quantidade_parcelas` (integer, opcional, default 1) |
| `descricao` (opcional) | `descricao` (string, obrigatório) |

---

### 1.2 `POST /faturas`
**Problema:** `cartao_id` documentado como `string` (ObjectId do MongoDB), mas a API usa o `id_cartao` sequencial (número inteiro).

| Antes (errado) | Depois (correto) |
|---|---|
| `cartao_id`: `string`, exemplo `"6507e8c9..."` | `cartao_id`: `integer`, exemplo `1` |

---

### 1.3 `POST /transacoes/pix`
**Problema:** campo documentado como `chave_destino`, mas o controller lê `chave`.

| Antes (errado) | Depois (correto) |
|---|---|
| `chave_destino` (obrigatório) | `chave` (obrigatório) |
| — | `descricao` (opcional, adicionado) |

---

### 1.4 `POST /chaves-pix`
**Problema:** enum do `tipo_chave` em minúsculo, incompatível com a validação do model que exige maiúsculo.

| Antes (errado) | Depois (correto) |
|---|---|
| `['cpf', 'email', 'telefone', 'chave_aleatoria']` | `['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA']` |

---

## 2. `src/services/compra_cartao_service.js` — Nomes de campos errados

**Problema:** o service referenciava campos que não existem no model `Cartao`.

| Antes (errado) | Depois (correto) |
|---|---|
| `cartao.limite_credito` | `cartao.limite_total` |
| `cartao.limite_utilizado` | `cartao.limite_usado` |

---

## 3. `src/services/fatura_service.js` — Método inexistente + campo errado

### 3.1 Método `criarFatura` não existia
**Problema:** `FaturaController.criar` chamava `FaturaService.criarFatura`, mas o método não estava implementado no service.

**Solução:** método `criarFatura({ cartao_id, mes, ano })` implementado. Ele:
- Busca o cartão pelo `id_cartao`
- Valida se já existe fatura para o mês/ano informado
- Cria a fatura vinculada à `conta_id` do cartão

### 3.2 Campo errado em `pagarFatura`

| Antes (errado) | Depois (correto) |
|---|---|
| `cartao.limite_utilizado` | `cartao.limite_usado` |

---

## 4. `src/services/cartao_service.js` — Dois bugs

### 4.1 `criarCartao` — `conta_id` salvo com valor errado
**Problema:** ao criar o cartão, `conta_id` era salvo com `conta.numero_conta` (string, ex: `"695082"`) em vez do ID sequencial.

| Antes (errado) | Depois (correto) |
|---|---|
| `conta_id: conta.numero_conta` | `conta_id: conta.id_conta` |

> ⚠️ Cartões criados antes desta correção estão com `conta_id` inválido no banco. Recomenda-se recriar os registros de teste.

### 4.2 Todos os métodos usavam `findById` (ObjectId) em vez do `id_cartao` sequencial
**Problema:** a API recebe o `id_cartao` (número inteiro), mas o service buscava com `findById()` que espera ObjectId do MongoDB, causando erro de cast.

**Métodos corrigidos** (`findById(id)` → `findOne({ id_cartao: Number(id) })`):
- `buscarCartao`
- `bloquearCartao`
- `desbloquearCartao`
- `alterarLimite`
- `consultarLimite`
- `deletarCartao` (também corrigido `deleteOne({ _id: id })` → `deleteOne({ id_cartao: Number(id) })`)
