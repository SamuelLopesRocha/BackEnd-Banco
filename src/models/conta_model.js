import mongoose from 'mongoose';

const contaSchema = new mongoose.Schema({

  id_conta: {
    type: Number,
    unique: true
  },

  usuario_id: {
    type: Number,
    required: true
  },

  agencia: {
    type: String,
    required: true
  },

  numero_conta: {
    type: String,
    required: true
  },

  digito: {
    type: String,
    required: true
  },

  tipo_conta: {
    type: String,
    enum: ['CORRENTE', 'POUPANCA'],
    required: true
  },

  saldo: {
    type: Number,
    default: 0
  },

  status_conta: {
    type: String,
    enum: ['ATIVA', 'BLOQUEADA', 'ENCERRADA'],
    default: 'ATIVA'
  },

  data_abertura: {
    type: Date,
    default: Date.now
  },

  ultima_movimentacao: {
    type: Date,
    default: null
  },

  // 🔵 CAMPOS CONTA CORRENTE
  limite_credito: {
    type: Number,
    default: 0
  },

  limite_utilizado: {
    type: Number,
    default: 0
  },

  taxa_manutencao: {
    type: Number,
    default: 0
  },

  permite_cheque_especial: {
    type: Boolean,
    default: false
  },

  // 🟣 CAMPOS CONTA POUPANÇA
  taxa_rendimento: {
    type: Number,
    default: 0
  },

  rendimento_acumulado: {
    type: Number,
    default: 0
  },

  aniversario_poupanca: {
    type: Number, // dia do mês (1 a 31)
    default: null
  }

}, {
  timestamps: true,
  versionKey: false
});


// 🔢 GERAR ID SEQUENCIAL AUTOMÁTICO
contaSchema.pre('save', async function () {
  if (this.isNew) {
    const ultimaConta = await mongoose.model('Conta')
      .findOne()
      .sort({ id_conta: -1 });

    this.id_conta = ultimaConta ? ultimaConta.id_conta + 1 : 1;
  }
});

contaSchema.index({ usuario_id: 1, tipo_conta: 1 }, { unique: true });

export const Conta = mongoose.model('Conta', contaSchema);
