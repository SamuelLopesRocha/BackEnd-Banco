import mongoose from 'mongoose';

const transacaoSchema = new mongoose.Schema({

  id_transacao: {
    type: Number,
    unique: true
  },

  conta_origem: {
    type: String,
    required: true
},

  conta_destino: {
    type: String,
    default: null
},

  tipo: {
    type: String,
    enum: ['PIX', 'TED', 'DEPOSITO', 'SAQUE'],
    required: true
  },

  valor: {
    type: Number,
    required: true,
    min: 0
  },

  // ORIGEM
  saldo_antes: {
    type: Number,
    required: true
  },

  saldo_depois: {
    type: Number,
    required: true
  },

  // DESTINO (IMPORTANTE PARA PIX/TED)
  saldo_antes_destino: {
    type: Number,
    default: null
  },

  saldo_depois_destino: {
    type: Number,
    default: null
  },

  descricao: {
    type: String,
    trim: true,
    default: null
  },

  data_transacao: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ['PENDENTE', 'CONCLUIDA', 'FALHA', 'CANCELADA'],
    default: 'CONCLUIDA'
  }

}, {
  timestamps: true,
  versionKey: false
});


// GERAR ID SEQUENCIAL
transacaoSchema.pre('save', async function () {
  if (this.isNew) {
    const ultima = await mongoose.model('Transacao')
      .findOne()
      .sort({ id_transacao: -1 });

    this.id_transacao = ultima ? ultima.id_transacao + 1 : 1;
  }
});


// ÍNDICES IMPORTANTES
transacaoSchema.index({ conta_origem: 1 });
transacaoSchema.index({ conta_destino: 1 });
transacaoSchema.index({ data_transacao: -1 });

export const Transacao = mongoose.model('Transacao', transacaoSchema);
