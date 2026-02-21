import mongoose from 'mongoose';

const chavePixSchema = new mongoose.Schema({
  chave: {
    type: String,
    required: true,
    unique: true, // Garante que a chave é única no banco todo
    trim: true
  },
  tipo_chave: {
    type: String,
    required: true,
    enum: ['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA']
  },
  numero_conta: {
    type: String,
    required: true
  },
  usuario_id: {
    type: Number,
    required: true
  },
  criado_em: {
    type: Date,
    default: Date.now
  }
});

export const ChavePix = mongoose.model('ChavePix', chavePixSchema);