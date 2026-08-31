require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../src/services/supabaseClient');

async function main() {
  const [nome, email, senha] = process.argv.slice(2);

  if (!nome || !email || !senha) {
    console.error('Uso: node scripts/criarAdmin.js "Nome" email@exemplo.com senha');
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const { data, error } = await supabase
    .from('administradores')
    .insert([{ nome, email, senha_hash: senhaHash }])
    .select('id, nome, email')
    .single();

  if (error) {
    console.error('Erro ao criar administrador:', error.message);
    process.exit(1);
  }

  console.log('Administrador criado:', data);
}

main();
