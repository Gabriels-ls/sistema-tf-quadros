const request = require('supertest');
require('./ajudantes/ambiente');

jest.mock('../src/services/supabaseClient', () => ({ from: jest.fn(), storage: { from: jest.fn() } }));
jest.mock('../src/services/openaiClient', () => ({ chat: { completions: { create: jest.fn() } } }));

const openai = require('../src/services/openaiClient');
const app = require('../src/app');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Atendimento pelo chatbot (RN02)', () => {
  test('recusa requisição sem mensagem ou sem token', async () => {
    const resposta = await request(app).post('/chatbot').send({ mensagem: 'Olá' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Mensagem e token são obrigatórios.');
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });

  test('recusa mensagem acima de 500 caracteres (RNF19)', async () => {
    const resposta = await request(app)
      .post('/chatbot')
      .send({ mensagem: 'a'.repeat(501), token: 'token-do-navegador' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toMatch(/Limite de 500 caracteres/);
    expect(openai.chat.completions.create).not.toHaveBeenCalled();
  });

  test('devolve a resposta gerada pelo modelo gpt-4o-mini', async () => {
    openai.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Fazemos quadros sob medida.' } }],
    });

    const resposta = await request(app)
      .post('/chatbot')
      .send({ mensagem: 'Vocês fazem sob medida?', token: 'token-do-navegador' });

    expect(resposta.status).toBe(200);
    expect(resposta.body.resposta).toBe('Fazemos quadros sob medida.');

    const argumentos = openai.chat.completions.create.mock.calls[0][0];
    expect(argumentos.model).toBe('gpt-4o-mini');
    expect(argumentos.messages[0].role).toBe('system');
    expect(argumentos.messages[1].content).toBe('Vocês fazem sob medida?');
  });

  test('responde com erro tratado quando a API da OpenAI falha', async () => {
    openai.chat.completions.create.mockRejectedValue(new Error('indisponível'));
    // a falha é registrada no servidor com console.error; o espião evita que o log esperado polua a saída
    const logDeErro = jest.spyOn(console, 'error').mockImplementation(() => {});

    const resposta = await request(app)
      .post('/chatbot')
      .send({ mensagem: 'Olá', token: 'token-do-navegador' });

    expect(resposta.status).toBe(500);
    expect(resposta.body.erro).toBe('Não foi possível processar sua mensagem no momento.');
    expect(logDeErro).toHaveBeenCalled();
    logDeErro.mockRestore();
  });
});
