import mongoose from 'mongoose';

const faturaSchema = new mongoose.Schema({

  id_fatura: {
    type: Number,
    unique: true
  },

  cartao_id: {
    type: Number,
    required: true,
    index: true
  },

  conta_id: {
    type: Number,
    required: true,
    index: true
  },

  mes_referencia: {
    type: String, // Ex: "2026-09"
    required: true
  },

  valor_total: {
    type: Number,
    default: 0
  },

  data_fechamento: {
    type: Date,
    required: true
  },

  data_vencimento: {
    type: Date,
    required: true
  },

  status_fatura: {
    type: String,
    enum: ['ABERTA', 'FECHADA', 'PAGA', 'ATRASADA'],
    default: 'ABERTA'
  },

  data_pagamento: {
    type: Date,
    default: null
  }

}, {
  timestamps: true,
  versionKey: false
});


// 🔢 ID SEQUENCIAL
faturaSchema.pre('save', async function () {

  if (this.isNew) {

    const ultima = await mongoose.model('Fatura')
      .findOne()
      .sort({ id_fatura: -1 });

    this.id_fatura = ultima ? ultima.id_fatura + 1 : 1;
  }

});


export const Fatura = mongoose.model('Fatura', faturaSchema);
