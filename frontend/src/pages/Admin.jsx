import { useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';

function Admin() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarOrcamentos() {
      try {
        const { data: sessaoData } = await supabase.auth.getSession();
        const token = sessaoData.session?.access_token;

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

    carregarOrcamentos();
  }, []);

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
              <th>Produto</th>
              <th>Qtd</th>
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
                <td>{orc.produtos?.nome}</td>
                <td>{orc.quantidade}</td>
                <td>{orc.status}</td>
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