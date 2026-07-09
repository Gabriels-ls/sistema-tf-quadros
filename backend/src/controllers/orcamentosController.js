const supabase = require('../services/supabaseClient');

async function criarOrcamento(req, res) {
  const { nome_cliente, email_cliente, telefone_cliente, produto_id, quantidade, token } = req.body;

  if (!nome_cliente || !email_cliente || !produto_id) {
    return res.status(400).json({ erro: 'Nome, e-mail e produto são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('orcamentos')
    .insert([{
      nome_cliente,
      email_cliente,
      telefone_cliente,
      produto_id,
      quantidade,
      token,
      status: 'pendente',
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
}

async function listarOrcamentosPorToken(req, res) {
  const { token } = req.params;

  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, produtos(nome, imagem_url)')
    .eq('token', token);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

module.exports = { criarOrcamento, listarOrcamentosPorToken };