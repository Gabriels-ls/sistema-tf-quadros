const supabase = require('../services/supabaseClient');

async function listarProdutos(req, res) {
  const { data, error } = await supabase
    .from('produtos')
    .select('*, produto_variacoes(id, nome, preco)');

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function buscarProdutoPorId(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('produtos')
    .select('*, produto_variacoes(id, nome, preco)')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  res.json(data);
}

async function criarProduto(req, res) {
  const { nome, descricao, preco, imagem_url } = req.body;

  if (!nome || !descricao) {
    return res.status(400).json({ erro: 'Nome e descrição são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert([{ nome, descricao, preco, imagem_url }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
}

async function editarProduto(req, res) {
  const { id } = req.params;
  const { nome, descricao, preco, imagem_url } = req.body;

  const { data, error } = await supabase
    .from('produtos')
    .update({ nome, descricao, preco, imagem_url })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function excluirProduto(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(204).send();
}

async function criarVariacao(req, res) {
  const { produtoId } = req.params;
  const { nome, preco } = req.body;

  if (!nome || preco === undefined || preco === null) {
    return res.status(400).json({ erro: 'Nome e preço da variação são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('produto_variacoes')
    .insert([{ produto_id: produtoId, nome, preco }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
}

async function editarVariacao(req, res) {
  const { variacaoId } = req.params;
  const { nome, preco } = req.body;

  const { data, error } = await supabase
    .from('produto_variacoes')
    .update({ nome, preco })
    .eq('id', variacaoId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function excluirVariacao(req, res) {
  const { variacaoId } = req.params;

  const { error } = await supabase
    .from('produto_variacoes')
    .delete()
    .eq('id', variacaoId);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(204).send();
}

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  editarProduto,
  excluirProduto,
  criarVariacao,
  editarVariacao,
  excluirVariacao,
};