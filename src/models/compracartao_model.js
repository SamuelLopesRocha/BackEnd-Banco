import mongoose from 'mongoose';

const compraCartaoSchema = new mongoose.Schema({

  id_compra: {
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

  valor_total: {
    type: Number,
    required: true,
    min: 0
  },

  valor_parcela: {
    type: Number,
    required: true
  },

  quantidade_parcelas: {
    type: Number,
    default: 1
  },

  parcela_atual: {
    type: Number,
    default: 1
  },

  descricao: {
    type: String,
    required: true,
    trim: true
  },

  data_compra: {
    type: Date,
    default: Date.now
  },

  status_compra: {
    type: String,
    enum: ['ATIVA', 'CANCELADA', 'ESTORNADA'],
    default: 'ATIVA'
}
,

  fatura_id: {
    type: Number,
    default: null
  },

  incluida_fatura: {
    type: Boolean,
    default: false
  },

  codigo_autorizacao: {
    type: String,
    required: true
  }

}, {
  timestamps: true,
  versionKey: false
});


// 🔢 ID SEQUENCIAL
compraCartaoSchema.pre('save', async function () {

  if (this.isNew) {

    const ultima = await mongoose.model('CompraCartao')
      .findOne()
      .sort({ id_compra: -1 });

    this.id_compra = ultima ? ultima.id_compra + 1 : 1;
  }

});


export const CompraCartao = mongoose.model('CompraCartao', compraCartaoSchema);
