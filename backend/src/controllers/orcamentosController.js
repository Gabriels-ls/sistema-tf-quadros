const supabase = require('../services/supabaseClient');
const openai = require('../services/openaiClient');

const CONTEXTO_RESUMO = `
Você resume conversas entre um cliente e o assistente virtual da TF Quadros, uma empresa que fabrica quadros para serigrafia.
Leia a conversa e escreva UMA única frase curta e direta (máximo 12 palavras) com o principal interesse ou dúvida do cliente.
Sem saudação, sem "o cliente perguntou/demonstrou", vá direto ao ponto (ex: "Quadro 100x150cm, quer prazo e disponibilidade").
Não invente informações que não estejam na conversa.
`;

function mensagensValidas(historicoConversa) {
  if (!Array.isArray(historicoConversa)) return [];
  return historicoConversa.filter(
    (msg) =>
      ['cliente', 'assistente'].includes(msg?.remetente) &&
      typeof msg.mensagem === 'string' &&
      msg.mensagem.trim().length > 0
  );
}

async function gerarResumoConversa(mensagens) {
  const transcricao = mensagens
    .map((msg) => `${msg.remetente === 'cliente' ? 'Cliente' : 'Assistente'}: ${msg.mensagem.trim()}`)
    .join('\n');

  try {
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CONTEXTO_RESUMO },
        { role: 'user', content: transcricao },
      ],
    });

    return resposta.choices[0].message.content.trim();
  } catch (err) {
    console.error('Erro ao gerar resumo da conversa:', err);
    return null;
  }
}

async function criarOrcamento(req, res) {
  const { nome_cliente, email_cliente, telefone_cliente, token, itens, historicoConversa } = req.body;

  if (!nome_cliente || !email_cliente || !itens || itens.length === 0) {
    return res.status(400).json({ erro: 'Nome, e-mail e ao menos um produto são obrigatórios.' });
  }

  const mensagens = mensagensValidas(historicoConversa);
  const resumoConversa = mensagens.length > 0 ? await gerarResumoConversa(mensagens) : null;

  const { data: cliente, error: erroCliente } = await supabase
    .from('clientes')
    .insert([{ nome: nome_cliente, email: email_cliente, telefone: telefone_cliente, token }])
    .select()
    .single();

  if (erroCliente) {
    return res.status(500).json({ erro: erroCliente.message });
  }

  const { data: orcamento, error: erroOrcamento } = await supabase
    .from('orcamentos')
    .insert([{ cliente_id: cliente.id, status: 'pendente', resumo_conversa: resumoConversa }])
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

  const idsVariacoes = itens.map((item) => item.variacao_id).filter(Boolean);
  let variacoes = [];
  if (idsVariacoes.length > 0) {
    const { data: dadosVariacoes, error: erroVariacoes } = await supabase
      .from('produto_variacoes')
      .select('id, nome, preco')
      .in('id', idsVariacoes);

    if (erroVariacoes) {
      return res.status(500).json({ erro: erroVariacoes.message });
    }
    variacoes = dadosVariacoes;
  }

  const itensParaInserir = itens.map((item) => {
    const produto = produtos.find((p) => p.id === Number(item.produto_id));
    const variacao = item.variacao_id
      ? variacoes.find((v) => v.id === Number(item.variacao_id))
      : null;
    return {
      orcamento_id: orcamento.id,
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      nome_produto: produto?.nome || 'Produto removido',
      preco_produto: variacao?.preco ?? produto?.preco ?? null,
      variacao_nome: variacao?.nome || null,
    };
  });

  const { error: erroItens } = await supabase
    .from('orcamento_itens')
    .insert(itensParaInserir);

  if (erroItens) {
    return res.status(500).json({ erro: erroItens.message });
  }

  // Histórico do chatbot é opcional e não deve derrubar a criação do orçamento se falhar.
  if (mensagens.length > 0) {
    const linhasHistorico = mensagens.map((msg, index) => ({
      orcamento_id: orcamento.id,
      ordem: index,
      remetente: msg.remetente,
      mensagem: msg.mensagem.trim(),
    }));

    const { error: erroHistorico } = await supabase
      .from('historico_chatbot')
      .insert(linhasHistorico);

    if (erroHistorico) {
      console.error('Erro ao salvar histórico do chatbot:', erroHistorico.message);
    }
  }

  res.status(201).json(orcamento);
}

async function listarOrcamentosPorToken(req, res) {
  const { token } = req.params;

  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, clientes!inner(nome, email, telefone, token), orcamento_itens(quantidade, nome_produto, preco_produto, variacao_nome)')
    .eq('clientes.token', token)
    .order('criado_em', { ascending: false });

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
}

async function listarTodosOrcamentos(req, res) {
  const { data, error } = await supabase
    .from('orcamentos')
    .select('*, clientes(nome, email, telefone), orcamento_itens(quantidade, nome_produto, preco_produto, variacao_nome), historico_chatbot(ordem, remetente, mensagem)')
    .order('criado_em', { ascending: false })
    .order('ordem', { foreignTable: 'historico_chatbot', ascending: true });

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