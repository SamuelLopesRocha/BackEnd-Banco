import mongoose from 'mongoose';

const cartaoSchema = new mongoose.Schema({

  id_cartao: {
    type: Number,
    unique: true
  },

  conta_id: {
    type: Number,
    required: true,
    index: true
  },

  numero_cartao: {
    type: String,
    required: true,
    unique: true
  },

  validade: {
    type: String,
    required: true
  },

  cvv_hash: {
    type: String,
    default: '2032'
  },

  tipo: {
    type: String,
    enum: ['DEBITO', 'CREDITO', 'MULTIPLO'],
    default: 'MULTIPLO'
  },

  bandeira: {
    type: String,
    enum: ['VISA', 'MASTERCARD', 'ELO'],
    default: 'VISA'
  },

  limite_credito: {
    type: Number,
    default: 0
  },

  limite_utilizado: {
    type: Number,
    default: 0
  },

  status_cartao: {
    type: String,
    enum: ['ATIVO', 'BLOQUEADO', 'CANCELADO'],
    default: 'ATIVO'
  },

  data_emissao: {
    type: Date,
    default: Date.now
  },

  data_bloqueio: {
    type: Date,
    default: null
  }

}, {
  timestamps: true,
  versionKey: false
});


// 🔢 GERAR ID SEQUENCIAL
cartaoSchema.pre('save', async function () {
  if (this.isNew) {

    const ultimo = await mongoose.model('Cartao')
      .findOne()
      .sort({ id_cartao: -1 });

    this.id_cartao = ultimo ? ultimo.id_cartao + 1 : 1;
  }
});


// 📌 ÍNDICES IMPORTANTES
cartaoSchema.index({ conta_id: 1 });
cartaoSchema.index({ numero_cartao: 1 });


export const Cartao = mongoose.model('Cartao', cartaoSchema);
