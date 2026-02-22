import mongoose from 'mongoose';

const { Schema } = mongoose;

const compraCartaoSchema = new Schema({

  id_compra: {
    type: Number,
    unique: true,
    index: true
  },

  // 🔗 RELACIONAMENTO COM CARTAO
  cartao_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cartao',
    required: true,
    index: true
  },

  // 🔗 RELACIONAMENTO COM CONTA
  conta_id: {
    type: Schema.Types.ObjectId,
    ref: 'Conta',
    required: true,
    index: true
  },

  // 💰 VALORES FINANCEIROS SEGUROS
  valor_total: {
    type: Schema.Types.Decimal128,
    required: true
  },

  valor_parcela: {
    type: Schema.Types.Decimal128,
    required: true
  },

  quantidade_parcelas: {
    type: Number,
    default: 1,
    min: 1
  },

  parcela_atual: {
    type: Number,
    default: 1,
    min: 1
  },

  descricao: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  data_compra: {
    type: Date,
    default: Date.now
  },

  status_compra: {
    type: String,
    enum: ['ATIVA', 'CANCELADA', 'ESTORNADA'],
    default: 'ATIVA',
    index: true
  },

  // 🔗 RELACIONAMENTO COM FATURA
  fatura_id: {
    type: Schema.Types.ObjectId,
    ref: 'Fatura',
    default: null
  },

  incluida_fatura: {
    type: Boolean,
    default: false
  },

  // 🔐 GERADO AUTOMATICAMENTE
  codigo_autorizacao: {
    type: String,
    unique: true
  }

}, {
  timestamps: true,
  versionKey: false
});


// 🔢 ID SEQUENCIAL (simples - depois podemos evoluir para Counter)
compraCartaoSchema.pre('save', async function (next) {

  if (this.isNew) {

    const ultima = await mongoose.model('CompraCartao')
      .findOne()
      .sort({ id_compra: -1 })
      .lean();

    this.id_compra = ultima ? ultima.id_compra + 1 : 1;
  }

  next();
});


// 🔐 GERA CODIGO_AUTORIZACAO AUTOMATICAMENTE
compraCartaoSchema.pre('validate', function (next) {

  if (!this.codigo_autorizacao) {
    this.codigo_autorizacao = new mongoose.Types.ObjectId().toString();
  }

  next();
});


// 💰 CALCULAR VALOR DA PARCELA COM PRECISÃO
compraCartaoSchema.pre('validate', function (next) {

  if (this.valor_total && this.quantidade_parcelas > 0) {

    const total = parseFloat(this.valor_total.toString());
    const parcela = total / this.quantidade_parcelas;

    this.valor_parcela = mongoose.Types.Decimal128.fromString(
      parcela.toFixed(2)
    );
  }

  next();
});


// 📈 INDEX COMPOSTO
compraCartaoSchema.index({ conta_id: 1, cartao_id: 1 });
compraCartaoSchema.index({ conta_id: 1, status_compra: 1 });


export const CompraCartao = mongoose.model('CompraCartao', compraCartaoSchema);