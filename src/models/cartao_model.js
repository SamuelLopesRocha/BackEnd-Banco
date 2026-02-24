import mongoose from 'mongoose';

const cartaoSchema = new mongoose.Schema({

  id_cartao: {
    type: Number,
    unique: true
  },

  usuario_id: {
    type: Number,
    required: true,
    index: true
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
    type: String
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

  limite_total: {
    type: Number,
    default: 1000
  },

  limite_usado: {
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

function gerarValidade() {
  const hoje = new Date();
  const ano = hoje.getFullYear() + 5;
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${mes}/${String(ano).slice(-2)}`;
}


// ===============================
// 🔢 PRE SAVE
// ===============================

cartaoSchema.pre('save', async function () {

  if (this.isNew) {

    const ultimo = await mongoose.model('Cartao')
      .findOne()
      .sort({ id_cartao: -1 });

    this.id_cartao = ultimo ? ultimo.id_cartao + 1 : 1;

    if (!this.numero_cartao) {
      this.numero_cartao = gerarNumeroCartao();
    }

    if (!this.cvv) {
      this.cvv = gerarCVV();
    }

    if (!this.validade) {
      this.validade = gerarValidade();
    }

  }

});


// ===============================
// 📊 VIRTUAL LIMITE DISPONIVEL
// ===============================

cartaoSchema.virtual('limite_disponivel').get(function () {
  return this.limite_total - this.limite_usado;
});


// ===============================
// 📌 INDEX
// ===============================

cartaoSchema.index({ usuario_id: 1 });
cartaoSchema.index({ conta_id: 1 });
cartaoSchema.index({ numero_cartao: 1 });


export const Cartao = mongoose.model('Cartao', cartaoSchema);