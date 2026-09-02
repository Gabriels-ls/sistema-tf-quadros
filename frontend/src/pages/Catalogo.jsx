import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import './Catalogo.css';

function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
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

    carregarProdutos();
  }, []);

  return (
    <Layout>
      <section className="catalogo-header">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--color-accent)' }}>Catálogo</span>
          <h1 className="catalogo-header__titulo">Nossos quadros</h1>
        </div>
      </section>

      <section className="container catalogo-lista">
        {carregando && <p>Carregando produtos...</p>}
        {erro && <p>{erro}</p>}

        {!carregando && !erro && (
          <div className="catalogo-grid">
            {produtos.map((produto) => {
              const temVariacoes = produto.grupos_variacao?.length > 0;
              const preco = temVariacoes
                ? Number(produto.preco ?? 0) +
                  produto.grupos_variacao.reduce((soma, grupo) => {
                    if (!grupo.opcoes_variacao?.length) return soma;
                    return soma + Math.min(...grupo.opcoes_variacao.map((o) => Number(o.preco_adicional)));
                  }, 0)
                : produto.preco;

              return (
                <Link to={`/produtos/${produto.id}`} key={produto.id} className="produto-card">
                  <div className="produto-card__imagem">
                    <img src={produto.imagem_url} alt={produto.nome} />
                  </div>
                  <div className="produto-card__info">
                    <h2 className="produto-card__nome">{produto.nome}</h2>
                    <p className="produto-card__descricao">{produto.descricao}</p>
                    <span className="produto-card__preco">
                      {temVariacoes ? 'A partir de ' : ''}R$ {preco}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Catalogo;