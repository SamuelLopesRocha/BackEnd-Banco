export const swaggerPaths = {
  '/usuarios/verificar-email': {
    get: {
      summary: 'Verificar e-mail do usuário',
      description: 'Ativa a conta do usuário a partir do token recebido no e-mail de verificação.',
      tags: ['Usuários'],
      parameters: [
        {
          name: 'token',
          in: 'query',
          required: true,
          description: 'Token de verificação enviado por e-mail',
          schema: {
            type: 'string',
            example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          },
        },
      ],
      responses: {
        '200': {
          description: 'E-mail verificado com sucesso. Conta ativada.',
          content: {
            'application/json': {
              example: { message: 'E-mail verificado com sucesso! A conta está ativa!' },
            },
          },
        },
        '400': {
          description: 'Token não informado.',
        },
        '404': {
          description: 'Token inválido ou já utilizado.',
        },
      },
    },
  },
  '/usuarios': {
    post: {
      summary: 'Criar novo usuário',
      tags: ['Usuários'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Usuario',
            },
            example: {
              nome_completo: 'João Silva',
              cpf: '12345678900',
              data_nascimento: '1990-05-15',
              email: 'joao@example.com',
              telefone: '11999999999',
              cidade: 'São Paulo',
              estado: 'SP',
              cep: '01310-100',
              numero: '123',
              complemento: 'Apto 101',
              senha: 'senha123',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Usuário criado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Usuario',
              },
            },
          },
        },
        '400': {
          description: 'Dados inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    get: {
      summary: 'Listar todos os usuários',
      tags: ['Usuários'],
      responses: {
        '200': {
          description: 'Lista de usuários',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Usuario',
                },
              },
            },
          },
        },
      },
    },
  },
  '/usuarios/meus-dados': {
    get: {
      summary: 'Obter dados do usuário autenticado',
      tags: ['Usuários'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Dados do usuário',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Usuario',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/usuarios/{id}': {
    get: {
      summary: 'Obter usuário por ID',
      tags: ['Usuários'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do usuário',
        },
      ],
      responses: {
        '200': {
          description: 'Dados do usuário',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Usuario',
              },
            },
          },
        },
        '404': {
          description: 'Usuário não encontrado',
        },
      },
    },
    put: {
      summary: 'Atualizar usuário',
      tags: ['Usuários'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do usuário',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Usuario',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Usuário atualizado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Usuario',
              },
            },
          },
        },
        '404': {
          description: 'Usuário não encontrado',
        },
      },
    },
    delete: {
      summary: 'Deletar usuário',
      tags: ['Usuários'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do usuário',
        },
      ],
      responses: {
        '200': {
          description: 'Usuário deletado com sucesso',
        },
        '404': {
          description: 'Usuário não encontrado',
        },
      },
    },
  },
  '/auth/login': {
    post: {
      summary: 'Fazer login',
      tags: ['Autenticação'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'senha'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'joao@example.com',
                },
                senha: {
                  type: 'string',
                  example: 'senha123',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login bem-sucedido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  usuario: {
                    $ref: '#/components/schemas/Usuario',
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Email ou senha inválidos',
        },
      },
    },
  },
  '/contas/poupanca': {
    post: {
      summary: 'Criar conta poupança',
      tags: ['Contas'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['usuario_id'],
              properties: {
                usuario_id: {
                  type: 'string',
                  example: '6507e8c9a1b234567890abcd',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Conta poupança criada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Conta',
              },
            },
          },
        },
        '400': {
          description: 'Dados inválidos',
        },
      },
    },
  },
  '/contas/{usuario_id}': {
    get: {
      summary: 'Listar contas do usuário',
      tags: ['Contas'],
      parameters: [
        {
          name: 'usuario_id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do usuário',
        },
      ],
      responses: {
        '200': {
          description: 'Lista de contas do usuário',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Conta',
                },
              },
            },
          },
        },
        '404': {
          description: 'Usuário não encontrado',
        },
      },
    },
  },
  '/transacoes/deposito': {
    post: {
      summary: 'Realizar depósito',
      tags: ['Transações'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor', 'descricao'],
              properties: {
                valor: {
                  type: 'number',
                  example: 500.00,
                },
                descricao: {
                  type: 'string',
                  example: 'Depósito inicial',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Depósito realizado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Transacao',
              },
            },
          },
        },
        '400': {
          description: 'Valores inválidos',
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/transacoes/saque': {
    post: {
      summary: 'Realizar saque',
      tags: ['Transações'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor'],
              properties: {
                valor: {
                  type: 'number',
                  example: 200.00,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Saque realizado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Transacao',
              },
            },
          },
        },
        '400': {
          description: 'Saldo insuficiente',
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/transacoes/pix': {
    post: {
      summary: 'Realizar transferência PIX',
      tags: ['Transações'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor', 'chave'],
              properties: {
                valor: {
                  type: 'number',
                  example: 150.00,
                },
                chave: {
                  type: 'string',
                  example: 'nic.macedo2020@gmail.com',
                },
                descricao: {
                  type: 'string',
                  example: 'Pagamento aluguel',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'PIX realizado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Transacao',
              },
            },
          },
        },
        '400': {
          description: 'Dados inválidos',
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/transacoes': {
    get: {
      summary: 'Listar minhas transações',
      tags: ['Transações'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Lista de transações do usuário',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Transacao',
                },
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/cartoes': {
    post: {
      summary: 'Criar novo cartão',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['numero', 'bandeira', 'titular', 'validade', 'cvv'],
              properties: {
                numero: {
                  type: 'string',
                  example: '4532123456789012',
                },
                bandeira: {
                  type: 'string',
                  enum: ['VISA', 'MASTERCARD', 'ELO'],
                  example: 'VISA',
                },
                titular: {
                  type: 'string',
                  example: 'JOAO SILVA',
                },
                validade: {
                  type: 'string',
                  example: '12/26',
                },
                cvv: {
                  type: 'string',
                  example: '123',
                },
                limite: {
                  type: 'number',
                  example: 5000.00,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Cartão criado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Cartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/cartoes/meus': {
    get: {
      summary: 'Listar meus cartões',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Lista de cartões do usuário',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Cartao',
                },
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/cartoes/{id}': {
    get: {
      summary: 'Obter cartão por ID',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      responses: {
        '200': {
          description: 'Dados do cartão',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Cartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Cartão não encontrado',
        },
      },
    },
    delete: {
      summary: 'Deletar cartão',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      responses: {
        '200': {
          description: 'Cartão deletado com sucesso',
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Cartão não encontrado',
        },
      },
    },
  },
  '/cartoes/{id}/bloquear': {
    patch: {
      summary: 'Bloquear cartão',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      responses: {
        '200': {
          description: 'Cartão bloqueado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Cartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Cartão não encontrado',
        },
      },
    },
  },
  '/cartoes/{id}/desbloquear': {
    patch: {
      summary: 'Desbloquear cartão',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      responses: {
        '200': {
          description: 'Cartão desbloqueado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Cartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Cartão não encontrado',
        },
      },
    },
  },
  '/cartoes/{id}/limite': {
    patch: {
      summary: 'Alterar limite do cartão',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['novo_limite'],
              properties: {
                novo_limite: {
                  type: 'number',
                  example: 10000.00,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Limite alterado com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Cartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Cartão não encontrado',
        },
      },
    },
    get: {
      summary: 'Consultar limite do cartão',
      tags: ['Cartões'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      responses: {
        '200': {
          description: 'Limite do cartão',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  limite: {
                    type: 'number',
                    example: 5000.00,
                  },
                  disponivel: {
                    type: 'number',
                    example: 3500.00,
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Cartão não encontrado',
        },
      },
    },
  },
  '/compras-cartao': {
    post: {
      summary: 'Realizar compra com cartão',
      tags: ['Compras com Cartão'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['numero_cartao', 'cvv', 'valor_total', 'descricao'],
              properties: {
                numero_cartao: {
                  type: 'string',
                  example: '4111111111111111',
                },
                cvv: {
                  type: 'string',
                  example: '123',
                },
                valor_total: {
                  type: 'number',
                  example: 299.99,
                },
                quantidade_parcelas: {
                  type: 'integer',
                  example: 1,
                  default: 1,
                },
                descricao: {
                  type: 'string',
                  example: 'Compra no supermercado',
                },
              },
            },
            example: {
              numero_cartao: '4111111111111111',
              cvv: '123',
              valor_total: 299.99,
              quantidade_parcelas: 1,
              descricao: 'Compra no supermercado',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Compra realizada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CompraCartao',
              },
            },
          },
        },
        '400': {
          description: 'Limite insuficiente',
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
    get: {
      summary: 'Listar minhas compras com cartão',
      tags: ['Compras com Cartão'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Lista de compras com cartão',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/CompraCartao',
                },
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/compras-cartao/{id}': {
    get: {
      summary: 'Obter compra por ID',
      tags: ['Compras com Cartão'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID da compra',
        },
      ],
      responses: {
        '200': {
          description: 'Dados da compra',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CompraCartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Compra não encontrada',
        },
      },
    },
  },
  '/compras-cartao/{id}/cancelar': {
    patch: {
      summary: 'Cancelar compra com cartão',
      tags: ['Compras com Cartão'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID da compra',
        },
      ],
      responses: {
        '200': {
          description: 'Compra cancelada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CompraCartao',
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Compra não encontrada',
        },
      },
    },
  },
  '/faturas': {
    post: {
      summary: 'Criar fatura',
      tags: ['Faturas'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['cartao_id', 'mes', 'ano'],
              properties: {
                cartao_id: {
                  type: 'integer',
                  example: 1,
                },
                mes: {
                  type: 'integer',
                  example: 3,
                },
                ano: {
                  type: 'integer',
                  example: 2026,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Fatura criada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Fatura',
              },
            },
          },
        },
      },
    },
  },
  '/faturas/cartao/{cartao_id}': {
    get: {
      summary: 'Listar faturas por cartão',
      tags: ['Faturas'],
      parameters: [
        {
          name: 'cartao_id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID do cartão',
        },
      ],
      responses: {
        '200': {
          description: 'Lista de faturas do cartão',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Fatura',
                },
              },
            },
          },
        },
      },
    },
  },
  '/faturas/{id}': {
    get: {
      summary: 'Buscar fatura por ID',
      tags: ['Faturas'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID da fatura',
        },
      ],
      responses: {
        '200': {
          description: 'Dados da fatura',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Fatura',
              },
            },
          },
        },
        '404': {
          description: 'Fatura não encontrada',
        },
      },
    },
  },
  '/faturas/{id}/fechar': {
    patch: {
      summary: 'Fechar fatura',
      tags: ['Faturas'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID da fatura',
        },
      ],
      responses: {
        '200': {
          description: 'Fatura fechada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Fatura',
              },
            },
          },
        },
        '404': {
          description: 'Fatura não encontrada',
        },
      },
    },
  },
  '/faturas/{id}/pagar': {
    patch: {
      summary: 'Pagar fatura',
      tags: ['Faturas'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'ID da fatura',
        },
      ],
      responses: {
        '200': {
          description: 'Fatura paga com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Fatura',
              },
            },
          },
        },
        '404': {
          description: 'Fatura não encontrada',
        },
      },
    },
  },
  '/chaves-pix': {
    post: {
      summary: 'Cadastrar chave PIX',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tipo_chave', 'chave'],
              properties: {
                tipo_chave: {
                  type: 'string',
                  enum: ['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA'],
                  example: 'CPF',
                },
                chave: {
                  type: 'string',
                  example: '12345678900',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Chave PIX cadastrada com sucesso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChavePix',
              },
            },
          },
        },
        '400': {
          description: 'Chave inválida',
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
    get: {
      summary: 'Listar minhas chaves PIX',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Lista de chaves PIX do usuário',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ChavePix',
                },
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
      },
    },
  },
  '/chaves-pix/{chave}': {
    delete: {
      summary: 'Excluir chave PIX',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'chave',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'A chave PIX',
        },
      ],
      responses: {
        '200': {
          description: 'Chave PIX excluída com sucesso',
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Chave PIX não encontrada',
        },
      },
    },
  },
  '/chaves-pix/consultar/{chave}': {
    get: {
      summary: 'Consultar origem da chave PIX',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'chave',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'A chave PIX a consultar',
        },
      ],
      responses: {
        '200': {
          description: 'Origem da chave PIX',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  usuario_id: {
                    type: 'string',
                  },
                  tipo_chave: {
                    type: 'string',
                  },
                  chave: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Não autenticado',
        },
        '404': {
          description: 'Chave PIX não encontrada',
        },
      },
    },
  },
};
