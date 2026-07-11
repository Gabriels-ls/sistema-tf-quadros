const supabase = require('../services/supabaseClient');

async function criarOrcamento(req, res) {
  const { nome_cliente, email_cliente, telefone_cliente, token, itens } = req.body;

  if (!nome_cliente || !email_cliente || !itens || itens.length === 0) {
    return res.status(400).json({ erro: 'Nome, e-mail e ao menos um produto são obrigatórios.' });
  }

  const { data: orcamento, error: erroOrcamento } = await supabase
    .from('orcamentos')
    .insert([{ nome_cliente, email_cliente, telefone_cliente, token, status: 'pendente' }])
    .select()
    .single();

  if (erroOrcamento) {
    return res.status(500).json({ erro: erroOrcamento.message });
  }

  // Buscar os dados atuais de cada produto para "fotografar" nome e preço
  const idsProdutos = itens.map((item) => item.produto_id);
  const { data: produtos, error: erroProdutos } = await supabase
    .from('produtos')
    .select('id, nome, preco')
    .in('id', idsProdutos);

  if (erroProdutos) {
    return res.status(500).json({ erro: erroProdutos.message });
  }

  const itensParaInserir = itens.map((item) => {
    const produto = produtos.find((p) => p.id === Number(item.produto_id));
    return {
      orcamento_id: orcamento.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      nome_produto: produto?.nome || 'Produto removido',
      preco_produto: produto?.preco || null,
    };
  });

  const { error: erroItens } = await supabase
    .from('orcamento_itens')
    .insert(itensParaInserir);

  if (erroItens) {
    return res.status(500).json({ erro: erroItens.message });
  }

  res.status(201).json(orcamento);
}

async function listarOrcamentosPorToken(req, res) {
  const { token } = req.params;

  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, orcamento_itens(quantidade, nome_produto, preco_produto)')
    .eq('token', token)
    .order('criado_em', { ascending: false });

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function listarTodosOrcamentos(req, res) {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, orcamento_itens(quantidade, nome_produto, preco_produto)')
    .order('criado_em', { ascending: false });

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function atualizarStatusOrcamento(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const statusValidos = ['pendente', 'em andamento', 'concluído'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }

  const { data, error } = await supabase
    .from('orcamentos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

module.exports = {
  criarOrcamento,
  listarOrcamentosPorToken,
  listarTodosOrcamentos,
  atualizarStatusOrcamento,
};