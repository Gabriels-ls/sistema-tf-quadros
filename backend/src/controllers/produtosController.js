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

async function buscarProdutoPorId(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  res.json(data);
}

module.exports = { listarProdutos, buscarProdutoPorId };