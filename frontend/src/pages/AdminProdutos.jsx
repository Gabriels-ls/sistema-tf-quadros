import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { obterTokenAdmin } from '../services/adminAuth';
import HeaderAdmin from '../components/HeaderAdmin';
import GruposVariacaoEditor from '../components/GruposVariacaoEditor';
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
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [gruposNovos, setGruposNovos] = useState([]);
  const [usaVariacoes, setUsaVariacoes] = useState(false);

  const inputImagemRef = useRef(null);

  const produtoEmEdicao = produtos.find((p) => p.id === editandoId);
  const gruposExibidos = editandoId
    ? (produtoEmEdicao?.grupos_variacao ?? []).map((g) => ({ ...g, opcoes: g.opcoes_variacao }))
    : gruposNovos;

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
  setGruposNovos([]);
  setUsaVariacoes(false);
}

  function iniciarEdicao(produto) {
  setEditandoId(produto.id);
  setNome(produto.nome);
  setDescricao(produto.descricao);
  setPreco(produto.preco);
  setImagemUrl(produto.imagem_url);
  setMostrarFormulario(true);
  setGruposNovos([]);
  setUsaVariacoes(produto.grupos_variacao?.length > 0);
  }

  async function handleSelecionarImagem(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setEnviandoImagem(true);

    try {
      const token = obterTokenAdmin();
      const formData = new FormData();
      formData.append('imagem', arquivo);

      const resposta = await api.post('/produtos/upload-imagem', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setImagemUrl(resposta.data.imagem_url);
    } catch (err) {
      console.error(err);
      alert('Não foi possível enviar a imagem.');
    } finally {
      setEnviandoImagem(false);
      e.target.value = '';
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();

    const gruposExistentes = produtoEmEdicao?.grupos_variacao ?? [];
    if (editandoId && !usaVariacoes && gruposExistentes.length > 0) {
      const confirmar = window.confirm(
        'Desativar variações vai excluir todos os grupos e opções já cadastrados deste produto. Deseja continuar?'
      );
      if (!confirmar) return;
    }

    setSalvando(true);

    try {
      const token = obterTokenAdmin();
      const headers = { Authorization: `Bearer ${token}` };
      const dados = { nome, descricao, preco: usaVariacoes ? null : preco, imagem_url: imagemUrl };

      if (editandoId) {
        await api.put(`/produtos/${editandoId}`, dados, { headers });

        if (!usaVariacoes) {
          for (const grupo of gruposExistentes) {
            await api.delete(`/produtos/${editandoId}/grupos-variacao/${grupo.id}`, { headers });
          }
        }
      } else {
        const resposta = await api.post('/produtos', dados, { headers });

        if (usaVariacoes) {
          for (const grupo of gruposNovos) {
            const respostaGrupo = await api.post(
              `/produtos/${resposta.data.id}/grupos-variacao`,
              { nome: grupo.nome },
              { headers }
            );

            for (const opcao of grupo.opcoes) {
              await api.post(
                `/grupos-variacao/${respostaGrupo.data.id}/opcoes`,
                { nome: opcao.nome, preco_adicional: opcao.preco_adicional },
                { headers }
              );
            }
          }
        }
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
              <div className="campo campo--toggle">
                <label className="admin-produtos__toggle">
                  <input
                    type="checkbox"
                    checked={usaVariacoes}
                    onChange={(e) => setUsaVariacoes(e.target.checked)}
                  />
                  <span className="admin-produtos__toggle-slider" />
                </label>
                <span>Produto com variações (ex: material, acabamento)</span>
              </div>

              {!usaVariacoes && (
                <div className="campo">
                  <label>Preço</label>
                  <input
                    type="number"
                    step="0.01"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                  />
                </div>
              )}
              <div className="campo">
                <label>Imagem</label>
                {imagemUrl && (
                  <img src={imagemUrl} alt="Prévia do produto" className="admin-produtos__preview-imagem" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={inputImagemRef}
                  onChange={handleSelecionarImagem}
                  disabled={enviandoImagem}
                  hidden
                />
                <button
                  type="button"
                  onClick={() => inputImagemRef.current?.click()}
                  disabled={enviandoImagem}
                  className="admin-produtos__escolher-imagem"
                >
                  {enviandoImagem ? 'Enviando...' : imagemUrl ? 'Trocar imagem' : 'Escolher imagem'}
                </button>
              </div>

              {usaVariacoes && (
                <div className="admin-produtos__variacoes">
                  <GruposVariacaoEditor
                    produtoId={editandoId}
                    grupos={gruposExibidos}
                    onGruposLocaisChange={setGruposNovos}
                    onPersistido={carregarProdutos}
                  />
                </div>
              )}

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
                  <th>Variações</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const temVariacoes = produto.grupos_variacao?.length > 0;

                  return (
                  <tr key={produto.id}>
                    <td>{produto.nome}</td>
                    <td>{produto.descricao}</td>
                    <td>{temVariacoes ? '—' : `R$ ${produto.preco}`}</td>
                    <td>
                      {temVariacoes
                        ? `${produto.grupos_variacao.length} grupo(s) de variação`
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProdutos;