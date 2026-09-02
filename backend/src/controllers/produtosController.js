const { randomUUID } = require('crypto');
const supabase = require('../services/supabaseClient');

const BUCKET_IMAGENS = 'produtos-imagens';

async function uploadImagem(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
  }

  const extensao = req.file.originalname.split('.').pop();
  const caminho = `${randomUUID()}.${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET_IMAGENS)
    .upload(caminho, req.file.buffer, { contentType: req.file.mimetype });

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  const { data } = supabase.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho);

  res.status(201).json({ imagem_url: data.publicUrl });
}

const SELECT_COM_GRUPOS = '*, grupos_variacao(id, nome, opcoes_variacao(id, nome, preco_adicional))';

function ordenarGruposEOpcoes(produto) {
  produto.grupos_variacao
    ?.sort((a, b) => a.id - b.id)
    .forEach((grupo) => grupo.opcoes_variacao?.sort((a, b) => a.id - b.id));
  return produto;
}

async function listarProdutos(req, res) {
  const { data, error } = await supabase.from('produtos').select(SELECT_COM_GRUPOS);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data.map(ordenarGruposEOpcoes));
}

async function buscarProdutoPorId(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT_COM_GRUPOS)
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  res.json(ordenarGruposEOpcoes(data));
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

async function criarGrupoVariacao(req, res) {
  const { produtoId } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome do grupo é obrigatório.' });
  }

  const { data, error } = await supabase
    .from('grupos_variacao')
    .insert([{ produto_id: produtoId, nome }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
}

async function editarGrupoVariacao(req, res) {
  const { grupoId } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome do grupo é obrigatório.' });
  }

  const { data, error } = await supabase
    .from('grupos_variacao')
    .update({ nome })
    .eq('id', grupoId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function excluirGrupoVariacao(req, res) {
  const { grupoId } = req.params;

  const { error } = await supabase
    .from('grupos_variacao')
    .delete()
    .eq('id', grupoId);

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
  criarGrupoVariacao,
  editarGrupoVariacao,
  excluirGrupoVariacao,
  uploadImagem,
};