const supabase = require('../services/supabaseClient');
const openai = require('../services/openaiClient');

const CONTEXTO_SISTEMA = `
Você é um assistente virtual da TF Quadros, uma empresa que fabrica quadros para serigrafia.
Seu papel é tirar dúvidas iniciais dos clientes sobre produtos, tamanhos, prazos e processo de orçamento.
Seja educado, breve e direto.
Se o cliente quiser fechar um pedido ou souber o preço exato, oriente-o a usar o botão de "Adicionar ao orçamento" no produto desejado, já que o orçamento final é feito por um atendente humano.
Não invente preços exatos, prazos exatos ou informações que você não tem certeza.
`;

async function conversar(req, res) {
  const { mensagem, token } = req.body;

  if (!mensagem || !token) {
    return res.status(400).json({ erro: 'Mensagem e token são obrigatórios.' });
  }

  try {
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CONTEXTO_SISTEMA },
        { role: 'user', content: mensagem },
      ],
    });

    const respostaTexto = resposta.choices[0].message.content;

    await supabase.from('conversas_chatbot').insert([{
      token,
      mensagem_usuario: mensagem,
      resposta_bot: respostaTexto,
    }]);

    res.json({ resposta: respostaTexto });
  } catch (err) {
    console.error('ERRO CAPTURADO NO CHATBOT:', err);
    res.status(500).json({ erro: 'Não foi possível processar sua mensagem no momento.' });
  }
}

module.exports = { conversar };