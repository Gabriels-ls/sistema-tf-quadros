const request = require('supertest');
const bcrypt = require('bcryptjs');
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

describe('Autenticação da área administrativa (RN01)', () => {
  test('bloqueia rota administrativa quando o token não é enviado', async () => {
    const resposta = await request(app).get('/orcamentos');

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('Token não fornecido.');
  });

  test('bloqueia rota administrativa quando o token é inválido', async () => {
    const resposta = await request(app)
      .post('/produtos')
      .set('Authorization', 'Bearer token-falso')
      .send({ nome: 'Quadro 30x40', descricao: 'Quadro para serigrafia' });

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('Token inválido ou expirado.');
  });

  test('libera rota administrativa quando o token é válido', async () => {
    configurarSupabase({
      produtos: { data: { id: 1, nome: 'Quadro 30x40' }, error: null },
    });

    const resposta = await request(app)
      .post('/produtos')
      .set('Authorization', `Bearer ${tokenAdmin()}`)
      .send({ nome: 'Quadro 30x40', descricao: 'Quadro para serigrafia' });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({ id: 1, nome: 'Quadro 30x40' });
  });

  test('login devolve token quando a senha confere com o hash armazenado', async () => {
    configurarSupabase({
      administradores: {
        data: {
          id: 1,
          nome: 'Gabriel',
          email: 'admin@tfquadros.com',
          senha_hash: bcrypt.hashSync('senha-correta', 10),
          ativo: true,
        },
        error: null,
      },
    });

    const resposta = await request(app)
      .post('/admin/login')
      .send({ email: 'admin@tfquadros.com', senha: 'senha-correta' });

    expect(resposta.status).toBe(200);
    expect(typeof resposta.body.token).toBe('string');
  });

  test('login recusa senha incorreta', async () => {
    configurarSupabase({
      administradores: {
        data: {
          id: 1,
          nome: 'Gabriel',
          email: 'admin@tfquadros.com',
          senha_hash: bcrypt.hashSync('senha-correta', 10),
          ativo: true,
        },
        error: null,
      },
    });

    const resposta = await request(app)
      .post('/admin/login')
      .send({ email: 'admin@tfquadros.com', senha: 'senha-errada' });

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('E-mail ou senha inválidos.');
  });

  test('login recusa administrador inativo', async () => {
    configurarSupabase({
      administradores: {
        data: {
          id: 1,
          nome: 'Gabriel',
          email: 'admin@tfquadros.com',
          senha_hash: bcrypt.hashSync('senha-correta', 10),
          ativo: false,
        },
        error: null,
      },
    });

    const resposta = await request(app)
      .post('/admin/login')
      .send({ email: 'admin@tfquadros.com', senha: 'senha-correta' });

    expect(resposta.status).toBe(401);
  });
});
