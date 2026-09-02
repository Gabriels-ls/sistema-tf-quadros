const supabase = require('../services/supabaseClient');

async function criarOpcao(req, res) {
  const { grupoId } = req.params;
  const { nome, preco_adicional } = req.body;

  if (!nome || preco_adicional === undefined || preco_adicional === null) {
    return res.status(400).json({ erro: 'Nome e preço adicional da opção são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('opcoes_variacao')
    .insert([{ grupo_id: grupoId, nome, preco_adicional }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
}

async function editarOpcao(req, res) {
  const { opcaoId } = req.params;
  const { nome, preco_adicional } = req.body;

  if (!nome || preco_adicional === undefined || preco_adicional === null) {
    return res.status(400).json({ erro: 'Nome e preço adicional da opção são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('opcoes_variacao')
    .update({ nome, preco_adicional })
    .eq('id', opcaoId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function excluirOpcao(req, res) {
  const { opcaoId } = req.params;

  const { error } = await supabase
    .from('opcoes_variacao')
    .delete()
    .eq('id', opcaoId);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(204).send();
}

module.exports = {
  criarOpcao,
  editarOpcao,
  excluirOpcao,
};
