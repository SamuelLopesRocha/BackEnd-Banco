import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerPaths } from './swagger-paths.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Banco App',
      version: '1.0.0',
      description: 'Documentação completa da API Banco App - Sistema bancário com contas, cartões, transações e PIX',
      contact: {
        name: 'Suporte API',
        email: 'suporte@bancoapp.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.bancoapp.com',
        description: 'Servidor de Produção',
      },
    ],
    paths: swaggerPaths,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação',
        },
      },
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nome_completo', 'cpf', 'data_nascimento', 'email', 'telefone', 'cidade', 'estado', 'cep', 'numero', 'senha'],
          properties: {
            usuario_id: {
              type: 'integer',
              example: 42,
            },
            nome_completo: {
              type: 'string',
              example: 'João Silva',
            },
            cpf: {
              type: 'string',
              example: '12345678900',
            },
            data_nascimento: {
              type: 'string',
              format: 'date',
              example: '1990-05-15',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@example.com',
            },
            telefone: {
              type: 'string',
              example: '11999999999',
            },
            cidade: {
              type: 'string',
              example: 'São Paulo',
            },
            estado: {
              type: 'string',
              example: 'SP',
            },
            cep: {
              type: 'string',
              example: '01310-100',
            },
            numero: {
              type: 'string',
              example: '123',
            },
            complemento: {
              type: 'string',
              example: 'Apartamento 101',
            },
            senha: {
              type: 'string',
              example: 'senha123',
              writeOnly: true,
            },
            status_conta: {
              type: 'string',
              example: 'ATIVA',
            },
            email_enviado: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Conta: {
          type: 'object',
          required: ['usuario_id', 'tipo'],
          properties: {
            _id: {
              type: 'string',
              example: '6507e8c9a1b234567890abce',
            },
            usuario_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcd',
            },
            tipo: {
              type: 'string',
              enum: ['poupanca', 'corrente'],
              example: 'poupanca',
            },
            saldo: {
              type: 'number',
              example: 1500.50,
            },
            numero_conta: {
              type: 'string',
              example: '123456-7',
            },
            agencia: {
              type: 'string',
              example: '0001',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Cartao: {
          type: 'object',
          required: ['usuario_id', 'numero', 'bandeira'],
          properties: {
            _id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcf',
            },
            usuario_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcd',
            },
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
            disponivel: {
              type: 'number',
              example: 5000.00,
            },
            bloqueado: {
              type: 'boolean',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Transacao: {
          type: 'object',
          required: ['usuario_id', 'tipo', 'valor'],
          properties: {
            _id: {
              type: 'string',
              example: '6507e8c9a1b234567890abd0',
            },
            usuario_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcd',
            },
            tipo: {
              type: 'string',
              enum: ['deposito', 'saque', 'pix'],
              example: 'deposito',
            },
            valor: {
              type: 'number',
              example: 500.00,
            },
            descricao: {
              type: 'string',
              example: 'Depósito inicial',
            },
            status: {
              type: 'string',
              enum: ['pendente', 'concluida', 'falha'],
              example: 'concluida',
            },
            data: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Fatura: {
          type: 'object',
          required: ['cartao_id', 'mes', 'ano'],
          properties: {
            _id: {
              type: 'string',
              example: '6507e8c9a1b234567890abd1',
            },
            cartao_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcf',
            },
            mes: {
              type: 'integer',
              example: 12,
            },
            ano: {
              type: 'integer',
              example: 2025,
            },
            total: {
              type: 'number',
              example: 1200.50,
            },
            pago: {
              type: 'boolean',
              example: false,
            },
            data_vencimento: {
              type: 'string',
              format: 'date-time',
            },
            data_fechamento: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        ChavePix: {
          type: 'object',
          required: ['usuario_id', 'tipo_chave', 'chave'],
          properties: {
            _id: {
              type: 'string',
              example: '6507e8c9a1b234567890abd2',
            },
            usuario_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcd',
            },
            tipo_chave: {
              type: 'string',
              enum: ['cpf', 'email', 'telefone', 'chave_aleatoria'],
              example: 'cpf',
            },
            chave: {
              type: 'string',
              example: '12345678900',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CompraCartao: {
          type: 'object',
          required: ['usuario_id', 'cartao_id', 'valor'],
          properties: {
            _id: {
              type: 'string',
              example: '6507e8c9a1b234567890abd3',
            },
            usuario_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcd',
            },
            cartao_id: {
              type: 'string',
              example: '6507e8c9a1b234567890abcf',
            },
            valor: {
              type: 'number',
              example: 299.99,
            },
            descricao: {
              type: 'string',
              example: 'Compra no supermercado',
            },
            local: {
              type: 'string',
              example: 'Supermercado XYZ',
            },
            status: {
              type: 'string',
              enum: ['pendente', 'confirmada', 'cancelada'],
              example: 'confirmada',
            },
            data: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Erro ao processar requisição',
            },
            status: {
              type: 'integer',
              example: 400,
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const specs = swaggerJsdoc(options);
