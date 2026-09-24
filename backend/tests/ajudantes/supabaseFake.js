// Simula o encadeamento do cliente do Supabase (supabase-js) usado nos controladores.
// Cada tabela recebe uma fila de respostas; cada chamada a supabase.from('tabela')
// consome a próxima resposta da fila daquela tabela.

function criarConsulta(resposta, registro) {
  const consulta = {};
  const metodos = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'limit'];

  metodos.forEach((metodo) => {
    consulta[metodo] = jest.fn((...args) => {
      registro.chamadas.push({ metodo, args });
      return consulta;
    });
  });

  consulta.single = jest.fn(() => Promise.resolve(resposta));
  consulta.maybeSingle = jest.fn(() => Promise.resolve(resposta));
  // permite "await supabase.from('x').insert(...)" sem .single()
  consulta.then = (resolve, reject) => Promise.resolve(resposta).then(resolve, reject);

  return consulta;
}

function criarSupabaseFake(respostasPorTabela = {}) {
  const registro = { chamadas: [], tabelas: [] };
  const filas = {};

  Object.entries(respostasPorTabela).forEach(([tabela, valor]) => {
    filas[tabela] = Array.isArray(valor) ? [...valor] : [valor];
  });

  const supabase = {
    from: jest.fn((tabela) => {
      registro.tabelas.push(tabela);
      const fila = filas[tabela] || [];
      const resposta = fila.length > 1 ? fila.shift() : fila[0] || { data: null, error: null };
      return criarConsulta(resposta, registro);
    }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'arquivo.png' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://exemplo/arquivo.png' } })),
      })),
    },
    registro,
  };

  return supabase;
}

module.exports = { criarSupabaseFake };
