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
  const [selecoes, setSelecoes] = useState({});
  const { adicionarItem } = useCarrinho();
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarProduto() {
      try {
        const resposta = await api.get(`/produtos/${id}`);
        setProduto(resposta.data);

        const iniciais = {};
        resposta.data.grupos_variacao?.forEach((grupo) => {
          if (grupo.opcoes_variacao?.length > 0) {
            iniciais[grupo.id] = String(grupo.opcoes_variacao[0].id);
          }
        });
        setSelecoes(iniciais);
      } catch (err) {
        setErro('Produto não encontrado.');
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [id]);

  const opcoesSelecionadas = (produto?.grupos_variacao ?? [])
    .filter((grupo) => grupo.opcoes_variacao?.length > 0)
    .map((grupo) => {
      const opcao = grupo.opcoes_variacao.find((o) => String(o.id) === selecoes[grupo.id]);
      return opcao && { id: opcao.id, nome: opcao.nome, preco_adicional: opcao.preco_adicional, grupo_nome: grupo.nome };
    })
    .filter(Boolean);

  const precoExibido =
    Number(produto?.preco ?? 0) +
    opcoesSelecionadas.reduce((soma, o) => soma + Number(o.preco_adicional), 0);

  function handleAdicionar() {
    adicionarItem(produto, Number(quantidade), opcoesSelecionadas);
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

            {produto.grupos_variacao
              ?.filter((grupo) => grupo.opcoes_variacao?.length > 0)
              .map((grupo) => (
                <div className="produto-detalhe__variacao" key={grupo.id}>
                  <label htmlFor={`grupo-${grupo.id}`}>{grupo.nome}</label>
                  <select
                    id={`grupo-${grupo.id}`}
                    value={selecoes[grupo.id] ?? ''}
                    onChange={(e) => setSelecoes((atual) => ({ ...atual, [grupo.id]: e.target.value }))}
                  >
                    {grupo.opcoes_variacao.map((opcao) => (
                      <option key={opcao.id} value={opcao.id}>
                        {opcao.nome}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

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