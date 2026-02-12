import mongoose from 'mongoose';

const cadastroSchema = new mongoose.Schema({

  usuario_id: {
    type: Number,
    unique: true
  },

  nome_completo: {
    type: String,
    required: true,
    trim: true
  },

  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  data_nascimento: {
    type: Date,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  
  senha: {
  type: String,
  required: true
  },  

  telefone: {
    type: String,
    required: true,
    trim: true
  },

  cidade: {
    type: String,
    required: true,
    trim: true
  },

  estado: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  cep: {
    type: String,
    required: true,
    trim: true
  },

  numero: {
    type: String,
    required: true,
    trim: true
  },

  complemento: {
    type: String,
    trim: true,
    default: null
  },

  status_conta: {
    type: String,
    enum: ['ATIVA', 'INATIVA', 'BLOQUEADA', 'EXCLUIDA'],
    default: 'ATIVA'
  },

  email_enviado: {
    type: Boolean,
    default: false
  },


}, {
  timestamps: true,
  versionKey: false
});


// 🔢 GERAR ID SEQUENCIAL — SEM NEXT()
cadastroSchema.pre('save', async function () {
  if (this.isNew) {
    const ultimo = await mongoose.model('Usuario')
      .findOne()
      .sort({ usuario_id: -1 });

    this.usuario_id = ultimo ? ultimo.usuario_id + 1 : 1;
  }
});

export const Usuario = mongoose.model('Usuario', cadastroSchema);
