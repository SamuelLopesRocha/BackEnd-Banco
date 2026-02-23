import mongoose from 'mongoose';

const transacaoSchema = new mongoose.Schema({

  id_transacao: {
    type: Number,
  },

  usuario_id: {
    type: Number,
    required: true
  },

  conta_origem: {
    type: String,
    required: true
  },

  // NOVO CAMPO
  conta_destino: {
    type: String,
    default: null
  },

  tipo: {
    type: String,
    enum: ['DEPOSITO', 'SAQUE', 'PIX_ENVIO', 'PIX_RECEBIMENTO'],
    required: true
  },

  valor: {
    type: Number,
    required: true,
    min: 0
  },

  saldo_antes: {
    type: Number,
    required: true
  },

  saldo_depois: {
    type: Number,
    required: true
  },

  descricao: {
    type: String,
    trim: true,
    default: null
  },

  // NOVO
  chave_pix: {
    type: String,
    default: null
  },

  // NOVO
  tipo_chave_pix: {
    type: String,
    enum: ['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA', null],
    default: null
  },

  status: {
    type: String,
    enum: ['CONCLUIDA', 'FALHA'],
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
transacaoSchema.index({ usuario_id: 1 });
transacaoSchema.index({ conta_origem: 1 });
transacaoSchema.index({ conta_destino: 1 }); // NOVO
transacaoSchema.index({ createdAt: -1 });

export const Transacao = mongoose.model('Transacao', transacaoSchema);