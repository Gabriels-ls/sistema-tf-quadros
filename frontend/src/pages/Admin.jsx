import { useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';
import HeaderAdmin from '../components/HeaderAdmin';
import './Admin.css';

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
    // carregarOrcamentos é reaproveitada por handleMudarStatus; setState só ocorre após o await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return (
    <div>
      <HeaderAdmin />
      <div className="container admin-conteudo">
        <h1 className="admin-titulo">Solicitações de Orçamento</h1>

        {carregando && <p>Carregando orçamentos...</p>}
        {erro && <p>{erro}</p>}

        {!carregando && !erro && orcamentos.length === 0 && (
          <p>Nenhuma solicitação recebida ainda.</p>
        )}

        {!carregando && !erro && orcamentos.length > 0 && (
          <div className="admin-tabela-wrapper">
            <table className="admin-tabela">
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
                      <ul className="admin-lista-produtos">
                        {orc.orcamento_itens?.map((item, idx) => (
                          <li key={idx}>{item.nome_produto} (x{item.quantidade})</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <select
                        className={`admin-status admin-status--${orc.status?.replace(' ', '-')}`}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;