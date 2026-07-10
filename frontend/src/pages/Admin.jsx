import { useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';

function Admin() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function obterToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function carregarOrcamentos() {
    try {
      const token = await obterToken();
      const resposta = await api.get('/orcamentos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrcamentos(resposta.data);
    } catch (err) {
      setErro('Não foi possível carregar os orçamentos.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  async function handleMudarStatus(id, novoStatus) {
    try {
      const token = await obterToken();
      await api.patch(
        `/orcamentos/${id}`,
        { status: novoStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      carregarOrcamentos();
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar o status.');
    }
  }

  if (carregando) return <p>Carregando orçamentos...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <h1>Painel Administrativo</h1>
      <h2>Solicitações de Orçamento</h2>

      {orcamentos.length === 0 ? (
        <p>Nenhuma solicitação recebida ainda.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Produtos</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {orcamentos.map((orc) => (
              <tr key={orc.id}>
                <td>{orc.nome_cliente}</td>
                <td>{orc.email_cliente}</td>
                <td>{orc.telefone_cliente}</td>
                <td>
                  <ul>
                    {orc.orcamento_itens?.map((item, idx) => (
                      <li key={idx}>
                        {item.produtos?.nome} (x{item.quantidade})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <select
                    value={orc.status}
                    onChange={(e) => handleMudarStatus(orc.id, e.target.value)}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em andamento">Em andamento</option>
                    <option value="concluído">Concluído</option>
                  </select>
                </td>
                <td>{new Date(orc.criado_em).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;