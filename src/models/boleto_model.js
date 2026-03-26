import mongoose from 'mongoose';

const boletoSchema = new mongoose.Schema({
  usuario_id: { type: Number, required: true, index: true },
  conta_id: { type: Number, required: true },
  valor: { type: Number, required: true },
  linha_digitavel: { type: String, required: true, unique: true },
  codigo_barras: { type: String, required: true },
  vencimento: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['PENDENTE', 'PAGO', 'CANCELADO'], 
    default: 'PENDENTE' 
  }
}, { timestamps: true, versionKey: false });

export const Boleto = mongoose.model('Boleto', boletoSchema);