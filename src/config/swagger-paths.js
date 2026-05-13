const errorResponse = {
  description: 'Erro na requisicao',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
};

const authErrorResponses = {
  401: {
    description: 'Token ausente, invalido ou expirado',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/Error' },
      },
    },
  },
};

const faturaErrorResponse = {
  description: 'Erro na requisicao',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/FaturaError' },
    },
  },
};

const expressDefaultErrorResponse = {
  description: 'Erro encaminhado ao manipulador padrao do Express',
};

export const swaggerPaths = {
  '/usuarios': {
    post: {
      summary: 'Criar novo usuario',
      tags: ['Usuarios'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['nome_completo', 'cpf', 'data_nascimento', 'email', 'telefone', 'cidade', 'estado', 'cep', 'numero', 'senha'],
              properties: {
                nome_completo: { type: 'string', example: 'Joao Silva' },
                cpf: { type: 'string', example: '12345678909' },
                data_nascimento: { type: 'string', format: 'date', example: '1990-05-15' },
                email: { type: 'string', format: 'email', example: 'joao@example.com' },
                telefone: { type: 'string', example: '11999999999' },
                cidade: { type: 'string', example: 'Sao Paulo' },
                estado: { type: 'string', example: 'SP' },
                cep: { type: 'string', example: '01310-100' },
                numero: { type: 'string', example: '123' },
                complemento: { type: 'string', example: 'Apto 101' },
                senha: { type: 'string', format: 'password', example: 'senha123' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuario criado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Usuario criado com sucesso! O codigo de ativacao chegara no seu e-mail em instantes.' },
                },
              },
            },
          },
        },
        400: errorResponse,
        500: errorResponse,
      },
    },
    get: {
      summary: 'Listar usuarios ativos ou nao excluidos',
      tags: ['Usuarios'],
      responses: {
        200: {
          description: 'Lista de usuarios',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Usuario' },
              },
            },
          },
        },
        500: errorResponse,
      },
    },
  },
  '/usuarios/verificar-codigo': {
    post: {
      summary: 'Verificar codigo de ativacao',
      tags: ['Usuarios'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'codigo'],
              properties: {
                email: { type: 'string', format: 'email', example: 'joao@example.com' },
                codigo: { type: 'string', example: '123456' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Conta verificada com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Conta verificada com sucesso!' },
                },
              },
            },
          },
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/usuarios/reenviar-codigo': {
    post: {
      summary: 'Reenviar codigo de ativacao',
      tags: ['Usuarios'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'joao@example.com' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Codigo gerado novamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Novo codigo gerado. O e-mail chegara em instantes.' },
                },
              },
            },
          },
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/usuarios/meus-dados': {
    get: {
      summary: 'Obter dados do usuario autenticado',
      tags: ['Usuarios'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: {
          description: 'Dados do usuario com informacoes da conta e chaves PIX',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/Usuario' },
                  {
                    type: 'object',
                    properties: {
                      saldo_disponivel: { type: 'number', example: 1000 },
                      saldo_poupanca: { type: 'number', example: 0 },
                      tipo_conta: { type: 'string', example: 'CORRENTE' },
                      numero_conta: { type: 'string', nullable: true, example: '123456' },
                      chaves_pix: { type: 'array', items: { type: 'string' } },
                    },
                  },
                ],
              },
            },
          },
        },
        ...authErrorResponses,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/usuarios/{id}': {
    get: {
      summary: 'Buscar usuario por usuario_id',
      tags: ['Usuarios'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: {
          description: 'Usuario encontrado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } },
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
    put: {
      summary: 'Atualizar dados editaveis do usuario',
      tags: ['Usuarios'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                nome_completo: { type: 'string', example: 'Joao Silva' },
                senha: { type: 'string', format: 'password', example: 'novaSenha123' },
                telefone: { type: 'string', example: '11999999999' },
                cidade: { type: 'string', example: 'Sao Paulo' },
                estado: { type: 'string', example: 'SP' },
                cep: { type: 'string', example: '01310-100' },
                numero: { type: 'string', example: '123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Usuario atualizado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  usuario: { $ref: '#/components/schemas/Usuario' },
                },
              },
            },
          },
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse,
      },
    },
    delete: {
      summary: 'Desativar usuario',
      tags: ['Usuarios'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: {
          description: 'Usuario desativado',
          content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } },
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/auth/login': {
    post: {
      summary: 'Fazer login com email ou CPF',
      tags: ['Autenticacao'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['senha'],
              properties: {
                email: { type: 'string', format: 'email', example: 'joao@example.com' },
                senha: { type: 'string', format: 'password', example: 'senha123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Login realizado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  token: { type: 'string' },
                  usuario: {
                    type: 'object',
                    properties: {
                      usuario_id: { type: 'integer' },
                      nome_completo: { type: 'string' },
                      cpf: { type: 'string' },
                      email: { type: 'string' },
                      status_conta: { type: 'string' },
                    },
                  },
                  conta: { $ref: '#/components/schemas/Conta' },
                },
              },
            },
          },
        },
        400: errorResponse,
        401: errorResponse,
        403: errorResponse,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/contas/poupanca': {
    post: {
      summary: 'Criar conta poupanca',
      tags: ['Contas'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['usuario_id'],
              properties: {
                usuario_id: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Conta poupanca criada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  conta: { $ref: '#/components/schemas/Conta' },
                },
              },
            },
          },
        },
        400: errorResponse,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/contas/{usuario_id}': {
    get: {
      summary: 'Listar contas de um usuario',
      tags: ['Contas'],
      parameters: [{ name: 'usuario_id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: {
          description: 'Contas do usuario',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  usuario_id: { type: 'string' },
                  total_contas: { type: 'integer' },
                  contas: { type: 'array', items: { $ref: '#/components/schemas/Conta' } },
                },
              },
            },
          },
        },
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/transacoes/deposito': {
    post: {
      summary: 'Realizar deposito na conta do usuario autenticado',
      tags: ['Transacoes'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor'],
              properties: {
                valor: { type: 'number', example: 500 },
                descricao: { type: 'string', maxLength: 200, example: 'Deposito inicial' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Deposito realizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transacao' } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/transacoes/saque': {
    post: {
      summary: 'Realizar saque da conta do usuario autenticado',
      tags: ['Transacoes'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor'],
              properties: {
                valor: { type: 'number', example: 200 },
                descricao: { type: 'string', maxLength: 200, example: 'Saque' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Saque realizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Transacao' } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/transacoes/pix': {
    post: {
      summary: 'Realizar transferencia PIX',
      tags: ['Transacoes'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['chave', 'valor'],
              properties: {
                chave: { type: 'string', example: 'joao@example.com' },
                valor: { type: 'number', example: 150 },
                descricao: { type: 'string', example: 'Pagamento aluguel' },
                codigo_pix: { type: 'string', description: 'Codigo de cobranca PIX opcional para baixa de cobranca pendente', example: 'PIX-COB-123456' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'PIX realizado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  destinatario_id: { type: 'integer' },
                  valor: { type: 'number' },
                  conta_origem: { type: 'string' },
                },
              },
            },
          },
        },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/transacoes': {
    get: {
      summary: 'Listar transacoes do usuario autenticado',
      tags: ['Transacoes'],
      security: [{ BearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 10, maximum: 100 } },
      ],
      responses: {
        200: {
          description: 'Transacoes paginadas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pagina: { type: 'integer' },
                  limite: { type: 'integer' },
                  total: { type: 'integer' },
                  total_paginas: { type: 'integer' },
                  dados: { type: 'array', items: { $ref: '#/components/schemas/Transacao' } },
                },
              },
            },
          },
        },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
  },
  '/cartoes': {
    post: {
      summary: 'Criar cartao para o usuario autenticado',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      description: 'O cartao e criado automaticamente a partir da conta do usuario autenticado. O corpo da requisicao nao e utilizado.',
      responses: {
        201: { description: 'Cartao criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cartao' } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/cartoes/meus': {
    get: {
      summary: 'Listar cartoes do usuario autenticado',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Lista de cartoes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Cartao' } } } } },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
  },
  '/cartoes/{id}': {
    get: {
      summary: 'Buscar cartao por _id',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Cartao encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cartao' } } } },
        ...authErrorResponses,
        404: errorResponse,
      },
    },
    delete: {
      summary: 'Deletar cartao por _id',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Cartao deletado', content: { 'application/json': { schema: { type: 'object', properties: { mensagem: { type: 'string' } } } } } },
        ...authErrorResponses,
        404: errorResponse,
      },
    },
  },
  '/cartoes/{id}/bloquear': {
    patch: {
      summary: 'Bloquear cartao',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Cartao bloqueado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cartao' } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/cartoes/{id}/desbloquear': {
    patch: {
      summary: 'Desbloquear cartao',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Cartao desbloqueado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cartao' } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/cartoes/{id}/limite': {
    patch: {
      summary: 'Alterar limite do cartao',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['novoLimite'],
              properties: {
                novoLimite: { type: 'number', example: 2500 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Limite alterado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cartao' } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
    get: {
      summary: 'Consultar limite do cartao',
      tags: ['Cartoes'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: {
          description: 'Limite do cartao',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  limite_total: { type: 'number' },
                  limite_usado: { type: 'number' },
                  limite_disponivel: { type: 'number' },
                },
              },
            },
          },
        },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/compras-cartao': {
    post: {
      summary: 'Realizar compra com cartao',
      tags: ['Compras com Cartao'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['numero_cartao', 'cvv', 'valor_total', 'descricao'],
              properties: {
                numero_cartao: { type: 'string', example: '4111111111111111' },
                cvv: { type: 'string', example: '123' },
                valor_total: { type: 'number', example: 299.99 },
                quantidade_parcelas: { type: 'integer', default: 1, example: 1 },
                descricao: { type: 'string', example: 'Compra no supermercado' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Compra realizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompraCartao' } } } },
        ...authErrorResponses,
        500: expressDefaultErrorResponse,
      },
    },
    get: {
      summary: 'Listar compras com cartao do usuario autenticado',
      tags: ['Compras com Cartao'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Lista de compras', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/CompraCartao' } } } } },
        ...authErrorResponses,
        500: expressDefaultErrorResponse,
      },
    },
  },
  '/compras-cartao/{id}': {
    get: {
      summary: 'Buscar compra por id_compra',
      tags: ['Compras com Cartao'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Compra encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompraCartao' } } } },
        ...authErrorResponses,
        500: expressDefaultErrorResponse,
      },
    },
  },
  '/compras-cartao/{id}/cancelar': {
    patch: {
      summary: 'Cancelar compra por id_compra',
      tags: ['Compras com Cartao'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Compra cancelada', content: { 'application/json': { schema: { $ref: '#/components/schemas/CompraCartao' } } } },
        ...authErrorResponses,
        500: expressDefaultErrorResponse,
      },
    },
  },
  '/faturas': {
    post: {
      summary: 'Criar ou obter fatura',
      tags: ['Faturas'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['cartao_id', 'conta_id'],
              properties: {
                cartao_id: { type: 'integer', example: 1 },
                conta_id: { type: 'integer', example: 1 },
                data_compra: { type: 'string', format: 'date-time', example: '2026-09-12T10:00:00.000Z' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Fatura criada ou encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Fatura' } } } },
        400: faturaErrorResponse,
      },
    },
  },
  '/faturas/cartao/{cartao_id}': {
    get: {
      summary: 'Listar faturas por cartao',
      tags: ['Faturas'],
      parameters: [{ name: 'cartao_id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Lista de faturas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Fatura' } } } } },
        400: faturaErrorResponse,
      },
    },
  },
  '/faturas/{id}': {
    get: {
      summary: 'Buscar fatura por id_fatura',
      tags: ['Faturas'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Fatura encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Fatura' } } } },
        404: faturaErrorResponse,
      },
    },
  },
  '/faturas/{id}/fechar': {
    patch: {
      summary: 'Fechar fatura',
      tags: ['Faturas'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: { description: 'Fatura fechada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Fatura' } } } },
        400: faturaErrorResponse,
      },
    },
  },
  '/faturas/{id}/pagar': {
    patch: {
      summary: 'Pagar fatura',
      tags: ['Faturas'],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: {
          description: 'Fatura paga',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mensagem: { type: 'string' },
                  valor_pago: { type: 'number' },
                  fatura: { $ref: '#/components/schemas/Fatura' },
                },
              },
            },
          },
        },
        400: faturaErrorResponse,
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
              required: ['chave', 'tipo_chave'],
              properties: {
                chave: { type: 'string', example: 'joao@example.com' },
                tipo_chave: { type: 'string', enum: ['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA'], example: 'EMAIL' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Chave PIX cadastrada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  chave: { $ref: '#/components/schemas/ChavePix' },
                },
              },
            },
          },
        },
        ...authErrorResponses,
        400: errorResponse,
        404: errorResponse,
        500: errorResponse,
      },
    },
    get: {
      summary: 'Listar chaves PIX do usuario autenticado',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Lista de chaves PIX', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ChavePix' } } } } },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
  },
  '/chaves-pix/{chave}': {
    delete: {
      summary: 'Excluir chave PIX',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'chave', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Chave excluida', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        ...authErrorResponses,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/chaves-pix/consultar/{chave}': {
    get: {
      summary: 'Consultar dados publicos de uma chave PIX',
      tags: ['Chaves PIX'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'chave', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: {
          description: 'Dados da chave PIX',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  chave: { type: 'string' },
                  numero_conta_destino: { type: 'string' },
                  nome_recebedor: { type: 'string' },
                },
              },
            },
          },
        },
        ...authErrorResponses,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/cobrancas': {
    post: {
      summary: 'Criar cobranca PIX',
      tags: ['Cobrancas'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor', 'codigo_pix', 'tipo'],
              properties: {
                valor: { type: 'number', example: 200 },
                codigo_pix: { type: 'string', example: 'PIX-COB-123456' },
                tipo: { type: 'string', example: 'PIX' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Cobranca criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cobranca' } } } },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
    get: {
      summary: 'Listar cobrancas do usuario autenticado',
      tags: ['Cobrancas'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Lista de cobrancas', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Cobranca' } } } } },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
  },
  '/cobrancas/{id}': {
    delete: {
      summary: 'Deletar cobranca por _id',
      tags: ['Cobrancas'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Cobranca deletada', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
  },
  '/boletos': {
    post: {
      summary: 'Gerar boleto',
      tags: ['Boletos'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['valor', 'vencimento'],
              properties: {
                valor: { type: 'number', example: 150 },
                vencimento: { type: 'string', format: 'date', example: '2026-12-31' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Boleto gerado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Boleto' } } } },
        ...authErrorResponses,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
  '/boletos/pendentes': {
    get: {
      summary: 'Listar boletos pendentes do usuario autenticado',
      tags: ['Boletos'],
      security: [{ BearerAuth: [] }],
      responses: {
        200: { description: 'Lista de boletos pendentes', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Boleto' } } } } },
        ...authErrorResponses,
        500: errorResponse,
      },
    },
  },
  '/boletos/pagar': {
    post: {
      summary: 'Pagar boleto por linha digitavel ou codigo de barras',
      tags: ['Boletos'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['codigo'],
              properties: {
                codigo: { type: 'string', example: '34191.09008 63391.234567 89101.12345 1 00000000012345' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Boleto pago', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        ...authErrorResponses,
        400: errorResponse,
      },
    },
  },
  '/boletos/{id}': {
    delete: {
      summary: 'Cancelar boleto por _id',
      tags: ['Boletos'],
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Boleto cancelado', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } },
        ...authErrorResponses,
        404: errorResponse,
        500: errorResponse,
      },
    },
  },
};
