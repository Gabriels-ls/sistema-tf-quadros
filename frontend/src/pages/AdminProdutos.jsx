import { useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';
import HeaderAdmin from '../components/HeaderAdmin';
import './AdminProdutos.css';

function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  async function obterToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  }

  async function carregarProdutos() {
    try {
      const resposta = await api.get('/produtos');
      setProdutos(resposta.data);
    } catch (err) {
      setErro('Não foi possível carregar os produtos.');
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    // carregarProdutos é reaproveitada por handleSalvar/handleExcluir; setState só ocorre após o await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarProdutos();
  }, []);

function limparFormulario() {
  setEditandoId(null);
  setNome('');
  setDescricao('');
  setPreco('');
  setImagemUrl('');
  setMostrarFormulario(false);
}

  function iniciarEdicao(produto) {
  setEditandoId(produto.id);
  setNome(produto.nome);
  setDescricao(produto.descricao);
  setPreco(produto.preco);
  setImagemUrl(produto.imagem_url);
  setMostrarFormulario(true);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);

    try {
      const token = await obterToken();
      const dados = { nome, descricao, preco, imagem_url: imagemUrl };

      if (editandoId) {
        await api.put(`/produtos/${editandoId}`, dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/produtos', dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      limparFormulario();
      carregarProdutos();
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar o produto.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id) {
    const confirmar = window.confirm('Tem certeza que deseja excluir este produto?');
    if (!confirmar) return;

    try {
      const token = await obterToken();
      await api.delete(`/produtos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarProdutos();
    } catch (err) {
      const mensagem = err.response?.data?.erro || 'Não foi possível excluir o produto.';
      alert(mensagem);
      console.error(err);
    }
  }

  return (
    <div>
      <HeaderAdmin />
      <div className="container admin-produtos">
        {!mostrarFormulario && (
          <div className="admin-produtos__acao-nova">
            <button onClick={() => setMostrarFormulario(true)} className="btn-primario">
              Adicionar produto
            </button>
          </div>
        )}

        {mostrarFormulario && (
          <div className="admin-produtos__form-box">
            <h2 className="admin-produtos__subtitulo">
              {editandoId ? 'Editar produto' : 'Novo produto'}
            </h2>
            <form onSubmit={handleSalvar} className="admin-produtos__form">
              <div className="campo">
                <label>Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Descrição</label>
                <input value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Preço</label>
                <input
                  type="number"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>
              <div className="campo">
                <label>URL da imagem</label>
                <input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} />
              </div>
              <div className="admin-produtos__acoes-form">
                <button type="submit" disabled={salvando} className="btn-primario">
                  {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Adicionar produto'}
                </button>
                <button type="button" onClick={limparFormulario} className="admin-produtos__cancelar">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <h1 className="admin-titulo">Produtos cadastrados</h1>

        {carregando && <p>Carregando produtos...</p>}
        {erro && <p>{erro}</p>}

        {!carregando && !erro && (
          <div className="admin-tabela-wrapper">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>{produto.descricao}</td>
                    <td>R$ {produto.preco}</td>
                    <td>
                      <div className="admin-produtos__acoes">
                        <button onClick={() => iniciarEdicao(produto)} className="admin-produtos__editar">
                          Editar
                        </button>
                        <button onClick={() => handleExcluir(produto.id)} className="admin-produtos__excluir">
                          Excluir
                        </button>
                      </div>
                    </td>
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

export default AdminProdutos;