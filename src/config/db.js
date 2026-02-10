import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/banco_app'
    );

    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
    process.exit(1);
  }
}
