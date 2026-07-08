import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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

  if (carregando) return <p>Carregando produtos...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <h1>Catálogo de Produtos</h1>
      <ul>
        {produtos.map((produto) => (
          <li key={produto.id}>
            <Link to={`/produtos/${produto.id}`}>
              <img src={produto.imagem_url} alt={produto.nome} width="100" />
              <h2>{produto.nome}</h2>
            </Link>
            <p>{produto.descricao}</p>
            <p>R$ {produto.preco}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Catalogo;