const supabase = require('../services/supabaseClient');

async function verificarAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = authHeader.replace('Bearer ', '');

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }

  req.usuario = data.user;
  next();
}

module.exports = verificarAutenticacao;