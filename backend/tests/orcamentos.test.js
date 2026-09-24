const request = require('supertest');
const { tokenAdmin } = require('./ajudantes/ambiente');
const { criarSupabaseFake } = require('./ajudantes/supabaseFake');

jest.mock('../src/services/supabaseClient', () => ({ from: jest.fn(), storage: { from: jest.fn() } }));
jest.mock('../src/services/openaiClient', () => ({ chat: { completions: { create: jest.fn() } } }));

const supabase = require('../src/services/supabaseClient');
const openai = require('../src/services/openaiClient');
const app = require('../src/app');

function configurarSupabase(respostas) {
  const fake = criarSupabaseFake(respostas);
  supabase.from = fake.from;
  supabase.storage = fake.storage;
  return fake;
}

function respostasPadrao(clienteExistente) {
  return {
    clientes: [
      { data: clienteExistente, error: null },
      { data: { id: clienteExistente ? clienteExistente.id : 7, nome: 'Maria' }, error: null },
    ],
    orcamentos: { data: { id: 99, status: 'pendente' }, error: null },
    produtos: { data: [{ id: 1, nome: 'Quadro 30x40', preco: 100 }], error: null },
    opcoes_variacao: { data: [], error: null },
    orcamento_itens: { data: null, error: null },
    historico_chatbot: { data: null, error: null },
  };
}

const pedido = {
  nome_cliente: 'Maria',
  email_cliente: 'maria@exemplo.com',
  telefone_cliente: '47999999999',
  token: 'token-do-navegador',
  itens: [{ produto_id: 1, quantidade: 2, opcoes_selecionadas: [] }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Solicitação de orçamento', () => {
  test('recusa solicitação sem nome, e-mail ou itens', async () => {
    const resposta = await request(app).post('/orcamentos').send({ nome_cliente: 'Maria', itens: [] });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Nome, e-mail e ao menos um produto são obrigatórios.');
  });

  test('cria o cadastro do cliente quando o token ainda não existe', async () => {
    const fake = configurarSupabase(respostasPadrao(null));

    const resposta = await request(app).post('/orcamentos').send(pedido);

    expect(resposta.status).toBe(201);
    const metodosEmClientes = fake.registro.chamadas.map((c) => c.metodo);
    expect(metodosEmClientes).toContain('insert');
  });

  test('reaproveita o cadastro do cliente quando o token já existe', async () => {
    const fake = configurarSupabase(respostasPadrao({ id: 7 }));

    const resposta = await request(app).post('/orcamentos').send(pedido);

    expect(resposta.status).toBe(201);
    // o cliente existente é atualizado, e não duplicado
    const tabelasUsadas = fake.registro.tabelas;
    expect(tabelasUsadas.filter((t) => t === 'clientes').length).toBe(2);
    expect(fake.registro.chamadas.some((c) => c.metodo === 'update')).toBe(true);
    const insercoesDeCliente = fake.registro.chamadas.filter(
      (c) => c.metodo === 'insert' && c.args[0]?.[0]?.token === pedido.token
    );
    expect(insercoesDeCliente).toHaveLength(0);
  });

  test('gera e grava o resumo da conversa quando há histórico do chatbot (RN05)', async () => {
    const fake = configurarSupabase(respostasPadrao({ id: 7 }));
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Quadro 30x40, quer prazo de entrega' } }],
    });

    const resposta = await request(app)
      .post('/orcamentos')
      .send({
        ...pedido,
        historicoConversa: [
          { remetente: 'cliente', mensagem: 'Vocês fazem quadro 30x40?' },
          { remetente: 'assistente', mensagem: 'Sim, fazemos sob medida.' },
        ],
      });

    expect(resposta.status).toBe(201);
    expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(fake.registro.tabelas).toContain('historico_chatbot');

    const insercaoDoOrcamento = fake.registro.chamadas.find(
      (c) => c.metodo === 'insert' && c.args[0]?.[0]?.status === 'pendente'
    );
    expect(insercaoDoOrcamento.args[0][0].resumo_conversa).toBe('Quadro 30x40, quer prazo de entrega');
  });

  test('não chama a OpenAI nem grava histórico quando não houve conversa (RN05)', async () => {
    const fake = configurarSupabase(respostasPadrao({ id: 7 }));

    const resposta = await request(app).post('/orcamentos').send(pedido);

    expect(resposta.status).toBe(201);
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
    expect(fake.registro.tabelas).not.toContain('historico_chatbot');
  });

  test('copia nome e preço do produto para o item do orçamento', async () => {
    const fake = configurarSupabase(respostasPadrao({ id: 7 }));

    await request(app).post('/orcamentos').send(pedido);

    const insercaoDosItens = fake.registro.chamadas.find(
      (c) => c.metodo === 'insert' && Array.isArray(c.args[0]) && c.args[0][0]?.orcamento_id === 99
    );
    expect(insercaoDosItens.args[0][0]).toMatchObject({
      nome_produto: 'Quadro 30x40',
      preco_produto: 100,
      quantidade: 2,
    });
  });
});

describe('Acompanhamento das solicitações pelo administrador', () => {
  test('exige autenticação para listar todas as solicitações', async () => {
    const resposta = await request(app).get('/orcamentos');

    expect(resposta.status).toBe(401);
  });

  test('recusa status fora dos valores previstos na RN04', async () => {
    configurarSupabase({ orcamentos: { data: null, error: null } });

    const resposta = await request(app)
      .patch('/orcamentos/99')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ status: 'finalizado' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Status inválido.');
  });

  test('aceita os status previstos na RN04', async () => {
    configurarSupabase({ orcamentos: { data: { id: 99, status: 'em andamento' }, error: null } });

    const resposta = await request(app)
      .patch('/orcamentos/99')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ status: 'em andamento' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe('em andamento');
  });

  test('lista as solicitações do cliente a partir do token do navegador', async () => {
    configurarSupabase({ orcamentos: { data: [{ id: 99, status: 'pendente' }], error: null } });

    const resposta = await request(app).get('/orcamentos/token/token-do-navegador');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
  });
});
