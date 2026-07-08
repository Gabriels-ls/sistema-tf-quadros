import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function ProdutoDetalhe() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarProduto() {
      try {
        const resposta = await api.get(`/produtos/${id}`);
        setProduto(resposta.data);
      } catch (err) {
        setErro('Produto não encontrado.');
        console.error(err);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [id]);

  if (carregando) return <p>Carregando produto...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <Link to="/">← Voltar ao catálogo</Link>
      <h1>{produto.nome}</h1>
      <img src={produto.imagem_url} alt={produto.nome} width="300" />
      <p>{produto.descricao}</p>
      <p>R$ {produto.preco}</p>
    </div>
  );
}

export default ProdutoDetalhe;