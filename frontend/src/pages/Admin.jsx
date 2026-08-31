import { Fragment, useEffect, useState } from 'react';
import api from '../services/api';
import { obterTokenAdmin } from '../services/adminAuth';
import HeaderAdmin from '../components/HeaderAdmin';
import './Admin.css';

function Admin() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [conversaExpandida, setConversaExpandida] = useState(null);

  async function carregarOrcamentos() {
    try {
      const token = obterTokenAdmin();
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
      const token = obterTokenAdmin();
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
                  <th>Conversa</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.map((orc) => (
                  <Fragment key={orc.id}>
                    <tr>
                      <td>{orc.clientes?.nome}</td>
                      <td>{orc.clientes?.email}</td>
                      <td>{orc.clientes?.telefone}</td>
                      <td>
                        <ul className="admin-lista-produtos">
                          {orc.orcamento_itens?.map((item, idx) => (
                            <li key={idx}>
                              {item.nome_produto}
                              {item.variacao_nome ? ` - ${item.variacao_nome}` : ''} (x{item.quantidade})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {orc.resumo_conversa ? (
                          <button
                            type="button"
                            className="admin-botao-conversa"
                            onClick={() => setConversaExpandida(conversaExpandida === orc.id ? null : orc.id)}
                          >
                            {conversaExpandida === orc.id ? 'Ocultar conversa' : 'Ver conversa'}
                          </button>
                        ) : (
                          <span className="admin-sem-conversa">Sem conversa</span>
                        )}
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
                    {conversaExpandida === orc.id && (
                      <tr>
                        <td colSpan={7}>
                          <div className="admin-conversa-detalhe">
                            <p className="admin-resumo-conversa">{orc.resumo_conversa}</p>
                            <ul className="admin-historico-completo">
                              {orc.historico_chatbot?.map((msg, idx) => (
                                <li
                                  key={idx}
                                  className={`admin-historico-msg admin-historico-msg--${msg.remetente}`}
                                >
                                  <strong>{msg.remetente === 'cliente' ? 'Cliente' : 'Assistente'}:</strong> {msg.mensagem}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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