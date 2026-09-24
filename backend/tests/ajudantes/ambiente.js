// Variáveis de ambiente usadas pelos testes (nenhum serviço externo é acessado:
// o Supabase e a OpenAI são substituídos por dublês nos próprios testes).
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://projeto.supabase.co';
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || 'chave-de-teste';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'chave-openai-de-teste';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

const jwt = require('jsonwebtoken');

function tokenAdmin() {
  return jwt.sign({ id: 1, nome: 'Administrador', email: 'admin@tfquadros.com' }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
}

module.exports = { tokenAdmin };
