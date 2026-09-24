const request = require('supertest');
const { tokenAdmin } = require('./ajudantes/ambiente');
const { criarSupabaseFake } = require('./ajudantes/supabaseFake');

jest.mock('../src/services/supabaseClient', () => ({ from: jest.fn(), storage: { from: jest.fn() } }));
jest.mock('../src/services/openaiClient', () => ({ chat: { completions: { create: jest.fn() } } }));

const supabase = require('../src/services/supabaseClient');
const app = require('../src/app');

function configurarSupabase(respostas) {
  const fake = criarSupabaseFake(respostas);
  supabase.from = fake.from;
  supabase.storage = fake.storage;
  return fake;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Catálogo de produtos', () => {
  test('lista os produtos com suas variações ordenadas', async () => {
    configurarSupabase({
      produtos: {
        data: [
          {
            id: 1,
            nome: 'Quadro 30x40',
            grupos_variacao: [
              { id: 2, nome: 'Material', opcoes_variacao: [{ id: 5, nome: 'Alumínio' }] },
              { id: 1, nome: 'Tamanho', opcoes_variacao: [{ id: 4, nome: '50x60' }, { id: 3, nome: '30x40' }] },
            ],
          },
        ],
        error: null,
      },
    });

    const resposta = await request(app).get('/produtos');

    expect(resposta.status).toBe(200);
    expect(resposta.body[0].grupos_variacao.map((g) => g.nome)).toEqual(['Tamanho', 'Material']);
    expect(resposta.body[0].grupos_variacao[0].opcoes_variacao.map((o) => o.id)).toEqual([3, 4]);
  });

  test('devolve 404 quando o produto não existe', async () => {
    configurarSupabase({ produtos: { data: null, error: { message: 'não encontrado' } } });

    const resposta = await request(app).get('/produtos/999');

    expect(resposta.status).toBe(404);
  });

  test('exige nome e descrição para cadastrar um produto (RN03)', async () => {
    configurarSupabase({ produtos: { data: null, error: null } });

    const resposta = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nome: 'Quadro 30x40' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Nome e descrição são obrigatórios.');
  });

  test('exige autenticação para excluir um produto', async () => {
    const resposta = await request(app).delete('/produtos/1');

    expect(resposta.status).toBe(401);
  });

  test('exige autenticação para cadastrar grupo de variação (RN06)', async () => {
    const resposta = await request(app).post('/produtos/1/grupos-variacao').send({ nome: 'Tamanho' });

    expect(resposta.status).toBe(401);
  });
});
