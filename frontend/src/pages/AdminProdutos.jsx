import { useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabaseClient';
import HeaderAdmin from '../components/HeaderAdmin';

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
    carregarProdutos();
  }, []);

  function limparFormulario() {
    setEditandoId(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setImagemUrl('');
  }

  function iniciarEdicao(produto) {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPreco(produto.preco);
    setImagemUrl(produto.imagem_url);
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
      console.error(err);
      alert('Não foi possível excluir o produto.');
    }
  }

  if (carregando) return <p>Carregando produtos...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <HeaderAdmin />
      <h1>Gerenciar Produtos</h1>

      <form onSubmit={handleSalvar}>
        <h2>{editandoId ? 'Editar produto' : 'Novo produto'}</h2>
        <div>
          <label>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Descrição</label>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>
        <div>
          <label>Preço</label>
          <input
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
          />
        </div>
        <div>
          <label>URL da imagem</label>
          <input value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} />
        </div>
        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Adicionar produto'}
        </button>
        {editandoId && (
          <button type="button" onClick={limparFormulario}>
            Cancelar edição
          </button>
        )}
      </form>

      <hr />

      <h2>Produtos cadastrados</h2>
      <table border="1" cellPadding="8">
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
                <button onClick={() => iniciarEdicao(produto)}>Editar</button>
                <button onClick={() => handleExcluir(produto.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProdutos;