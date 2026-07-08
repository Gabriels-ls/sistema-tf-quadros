const supabase = require('../services/supabaseClient');

async function listarProdutos(req, res) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*');

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

module.exports = { listarProdutos };