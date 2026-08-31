import { useEffect, useState } from 'react';
import api from '../services/api';
import { obterTokenAdmin } from '../services/adminAuth';
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

  const [editandoVariacaoId, setEditandoVariacaoId] = useState(null);
  const [nomeVariacao, setNomeVariacao] = useState('');
  const [precoVariacao, setPrecoVariacao] = useState('');
  const [salvandoVariacao, setSalvandoVariacao] = useState(false);

  const produtoEmEdicao = produtos.find((p) => p.id === editandoId);

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
  limparFormularioVariacao();
}

  function iniciarEdicao(produto) {
  setEditandoId(produto.id);
  setNome(produto.nome);
  setDescricao(produto.descricao);
  setPreco(produto.preco);
  setImagemUrl(produto.imagem_url);
  setMostrarFormulario(true);
  limparFormularioVariacao();
  }

  function limparFormularioVariacao() {
    setEditandoVariacaoId(null);
    setNomeVariacao('');
    setPrecoVariacao('');
  }

  function iniciarEdicaoVariacao(variacao) {
    setEditandoVariacaoId(variacao.id);
    setNomeVariacao(variacao.nome);
    setPrecoVariacao(variacao.preco);
  }

  async function handleSalvarVariacao(e) {
    e.preventDefault();
    setSalvandoVariacao(true);

    try {
      const token = obterTokenAdmin();
      const dados = { nome: nomeVariacao, preco: precoVariacao };

      if (editandoVariacaoId) {
        await api.put(`/produtos/${editandoId}/variacoes/${editandoVariacaoId}`, dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(`/produtos/${editandoId}/variacoes`, dados, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      limparFormularioVariacao();
      carregarProdutos();
    } catch (err) {
      console.error(err);
      alert('Não foi possível salvar a variação.');
    } finally {
      setSalvandoVariacao(false);
    }
  }

  async function handleExcluirVariacao(variacaoId) {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta variação?');
    if (!confirmar) return;

    try {
      const token = obterTokenAdmin();
      await api.delete(`/produtos/${editandoId}/variacoes/${variacaoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarProdutos();
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir a variação.');
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);

    try {
      const token = obterTokenAdmin();
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
      const token = obterTokenAdmin();
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

            {editandoId && (
              <div className="admin-produtos__variacoes">
                <h3 className="admin-produtos__subtitulo-variacoes">
                  Variações (opcional — ex: material, acabamento)
                </h3>

                {produtoEmEdicao?.produto_variacoes?.length > 0 && (
                  <ul className="admin-produtos__lista-variacoes">
                    {produtoEmEdicao.produto_variacoes.map((v) => (
                      <li key={v.id}>
                        <span>{v.nome} — R$ {v.preco}</span>
                        <div className="admin-produtos__acoes">
                          <button
                            type="button"
                            onClick={() => iniciarEdicaoVariacao(v)}
                            className="admin-produtos__editar"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExcluirVariacao(v.id)}
                            className="admin-produtos__excluir"
                          >
                            Excluir
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleSalvarVariacao} className="admin-produtos__form-variacao">
                  <input
                    placeholder="Nome (ex: Alumínio)"
                    value={nomeVariacao}
                    onChange={(e) => setNomeVariacao(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={precoVariacao}
                    onChange={(e) => setPrecoVariacao(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={salvandoVariacao} className="btn-primario">
                    {editandoVariacaoId ? 'Salvar variação' : 'Adicionar variação'}
                  </button>
                  {editandoVariacaoId && (
                    <button
                      type="button"
                      onClick={limparFormularioVariacao}
                      className="admin-produtos__cancelar"
                    >
                      Cancelar
                    </button>
                  )}
                </form>
              </div>
            )}
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
                  <th>Variações</th>
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
                      {produto.produto_variacoes?.length > 0
                        ? `${produto.produto_variacoes.length} variação(ões)`
                        : '—'}
                    </td>
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