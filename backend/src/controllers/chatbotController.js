const supabase = require('../services/supabaseClient');
const openai = require('../services/openaiClient');

const MAX_CARACTERES_MENSAGEM = 500;

const CONTEXTO_SISTEMA = `
Você é um assistente virtual da TF Quadros, uma empresa que fabrica quadros para serigrafia.
Seu papel é tirar dúvidas iniciais dos clientes sobre produtos, tamanhos, prazos e processo de orçamento.
Seja educado, breve e direto.
Se o cliente quiser fechar um pedido ou souber o preço exato, oriente-o a usar o botão de "Adicionar ao orçamento" no produto desejado, já que o orçamento final é feito por um atendente humano.
Não invente preços exatos, prazos exatos ou informações que você não tem certeza, não fale sobre assuntos que não sejam relacionados.

Telas de serigrafia: tamanhos, produção e usos
Como interpretar
Medidas como 50x60 são o tamanho do quadro, em centímetros. O número da tela (tela 43, tela 90 etc.) indica a quantidade de fios por centímetro da malha. Quanto maior o número, mais fechada é a malha e mais definição ela permite. Quanto menor, mais aberta ela é e mais tinta ou material deixa passar. Por isso, as telas de número baixo são usadas para efeitos como relevo, flocado e glitter.

Tamanhos mais usados
Os tamanhos mais usados são 50x60, 50x70, 40x50, 60x80 e 55x75. O 50x60 é, de longe, o que mais sai. Existem outros tamanhos, mas esses são os principais.

Proporção das telas na produção
Todos os tamanhos seguem o mesmo padrão: cerca de 80% da produção é de tela 43. Os outros 20% se dividem entre as demais telas (12, 32, 36, 55, 68, 77 e 90), que saem menos, mas também têm saída.

Para que serve cada tela
Telas 43 e 55: usadas em praticamente todos os desenhos. A 55 entra nas partes que precisam de mais definição, e a 43 no restante, que é chapado (cor sólida, preenchida).
Tela 68: usada quando o desenho tem traços finos junto com alguma cor chapada. Também serve para retículas com pontos mais grossos.
Telas 77 e 90 (malha amarela): usadas para cromia, ou seja, impressão em 4 cores (CMYK: ciano, magenta, amarelo e preto). São indicadas para imagens (como fotos) e desenhos com muitas cores, que são reproduzidos combinando apenas essas 4 cores. Também podem ser usadas para fazer as retículas de alguns detalhes do desenho.
Telas 32 e 36: usadas para flocado e gel relevo. A escolha entre uma e outra é preferência de cada estamparia. A 32 permite fazer um pouco mais de relevo.
Tela 12: usada para glitter. Só serve para desenhos que não exigem definição.
`;

// Preços ficam de fora de propósito: o assistente não deve informar valores.
const SELECT_CATALOGO = 'nome, descricao, grupos_variacao(nome, opcoes_variacao(nome))';

function formatarCatalogo(produtos) {
  if (!produtos?.length) {
    return '';
  }

  const linhas = produtos.map((produto) => {
    const variacoes = (produto.grupos_variacao || [])
      .filter((grupo) => grupo.opcoes_variacao?.length)
      .map((grupo) => `${grupo.nome}: ${grupo.opcoes_variacao.map((opcao) => opcao.nome).join(', ')}`);

    let linha = `- ${produto.nome}`;
    if (produto.descricao) linha += `: ${produto.descricao}`;
    if (variacoes.length) linha += ` (${variacoes.join('; ')})`;
    return linha;
  });

  return `
Catálogo atual de produtos do site
Use esta lista para responder sobre os produtos disponíveis. Se o cliente perguntar por algo que não está aqui, diga que não encontrou no catálogo e sugira falar com um atendente.
${linhas.join('\n')}
`;
}

// Se o catálogo não puder ser carregado, o chatbot segue funcionando só com o contexto fixo.
async function montarContextoSistema() {
  try {
    const { data, error } = await supabase.from('produtos').select(SELECT_CATALOGO);

    if (error) {
      console.error('ERRO AO CARREGAR CATÁLOGO PARA O CHATBOT:', error);
      return CONTEXTO_SISTEMA;
    }

    return CONTEXTO_SISTEMA + formatarCatalogo(data);
  } catch (err) {
    console.error('ERRO AO CARREGAR CATÁLOGO PARA O CHATBOT:', err);
    return CONTEXTO_SISTEMA;
  }
}

async function conversar(req, res) {
  const { mensagem, token } = req.body;

  if (!mensagem || !token) {
    return res.status(400).json({ erro: 'Mensagem e token são obrigatórios.' });
  }

  if (mensagem.length > MAX_CARACTERES_MENSAGEM) {
    return res.status(400).json({
      erro: `Mensagem muito longa. Limite de ${MAX_CARACTERES_MENSAGEM} caracteres.`,
    });
  }

  try {
    const contextoSistema = await montarContextoSistema();

    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contextoSistema },
        { role: 'user', content: mensagem },
      ],
    });

    const respostaTexto = resposta.choices[0].message.content;

    res.json({ resposta: respostaTexto });
  } catch (err) {
    console.error('ERRO CAPTURADO NO CHATBOT:', err);
    res.status(500).json({ erro: 'Não foi possível processar sua mensagem no momento.' });
  }
}

module.exports = { conversar };