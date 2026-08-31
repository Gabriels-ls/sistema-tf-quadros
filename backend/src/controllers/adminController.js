const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  const { data: admin, error } = await supabase
    .from('administradores')
    .select('id, nome, email, senha_hash, ativo')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  if (!admin || !admin.ativo) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  const token = jwt.sign(
    { id: admin.id, nome: admin.nome, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, nome: admin.nome, email: admin.email });
}

module.exports = { login };
