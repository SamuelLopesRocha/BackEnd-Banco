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
    unique: true
  },

  validade: {
    type: String,
    default: '12/32'
  },

  cvv: {
    type: String
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


// ===============================
// 🔢 GERADORES
// ===============================

function gerarNumeroCartao() {
  let numero = '';
  for (let i = 0; i < 16; i++) {
    numero += Math.floor(Math.random() * 10);
  }
  return numero;
}

function gerarCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}


// ===============================
// 🔢 ID SEQUENCIAL + DADOS AUTO
// ===============================
cartaoSchema.pre('save', async function () {

  if (this.isNew) {

    // ID sequencial
    const ultimo = await mongoose.model('Cartao')
      .findOne()
      .sort({ id_cartao: -1 });

    this.id_cartao = ultimo ? ultimo.id_cartao + 1 : 1;

    // Número cartão automático
    if (!this.numero_cartao) {
      this.numero_cartao = gerarNumeroCartao();
    }

    // CVV automático
    if (!this.cvv) {
      this.cvv = gerarCVV();
    }

  }

});


// ===============================
// 📌 ÍNDICES
// ===============================
cartaoSchema.index({ conta_id: 1 });
cartaoSchema.index({ numero_cartao: 1 });


export const Cartao = mongoose.model('Cartao', cartaoSchema);
