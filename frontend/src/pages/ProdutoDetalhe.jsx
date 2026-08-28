import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCarrinho } from '../context/useCarrinho';
import Layout from '../components/Layout';
import './ProdutoDetalhe.css';

function ProdutoDetalhe() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [variacaoId, setVariacaoId] = useState('');
  const { adicionarItem } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarProduto() {
      try {
        const resposta = await api.get(`/produtos/${id}`);
        setProduto(resposta.data);
        if (resposta.data.produto_variacoes?.length > 0) {
          setVariacaoId(String(resposta.data.produto_variacoes[0].id));
        }
      } catch (err) {
        setErro('Produto não encontrado.');
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [id]);

  const variacaoSelecionada = produto?.produto_variacoes?.find(
    (v) => String(v.id) === variacaoId
  );
  const precoExibido = variacaoSelecionada?.preco ?? produto?.preco;

  function handleAdicionar() {
    adicionarItem(produto, Number(quantidade), variacaoSelecionada || null);
    navigate('/carrinho');
  }

  if (carregando) {
    return (
      <Layout>
        <div className="container" style={{ padding: '60px 0' }}>
          <p>Carregando produto...</p>
        </div>
      </Layout>
    );
  }

  if (erro) {
    return (
      <Layout>
        <div className="container" style={{ padding: '60px 0' }}>
          <p>{erro}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container produto-detalhe">
        <Link to="/produtos" className="produto-detalhe__voltar">← Voltar ao catálogo</Link>

        <div className="produto-detalhe__grade">
          <div className="produto-detalhe__imagem">
            <img src={produto.imagem_url} alt={produto.nome} />
          </div>

          <div className="produto-detalhe__info">
            <h1 className="produto-detalhe__nome">{produto.nome}</h1>
            <p className="produto-detalhe__preco">R$ {precoExibido}</p>
            <p className="produto-detalhe__descricao">{produto.descricao}</p>

            {produto.produto_variacoes?.length > 0 && (
              <div className="produto-detalhe__variacao">
                <label htmlFor="variacao">Variação</label>
                <select
                  id="variacao"
                  value={variacaoId}
                  onChange={(e) => setVariacaoId(e.target.value)}
                >
                  {produto.produto_variacoes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nome} — R$ {v.preco}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="produto-detalhe__quantidade">
              <label htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <button onClick={handleAdicionar} className="btn-primario">
              Adicionar ao orçamento
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProdutoDetalhe;