import mongoose from 'mongoose';

const cobrancaSchema = new mongoose.Schema({
  usuario_id: { type: Number, required: true },
  valor: { type: Number, required: true },
  codigo_pix: { type: String, required: true },
  tipo: { type: String, required: true },
  status: { type: String, default: 'PENDENTE' }
}, { timestamps: true });

export const Cobranca = mongoose.model('Cobranca', cobrancaSchema);