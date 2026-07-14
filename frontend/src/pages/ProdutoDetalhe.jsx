import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCarrinho } from '../context/CarrinhoContext';

function ProdutoDetalhe() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const { adicionarItem } = useCarrinho();
  const navigate = useNavigate();

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

  function handleAdicionar() {
    adicionarItem(produto, Number(quantidade));
    navigate('/carrinho');
  }

  if (carregando) return <p>Carregando produto...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <Link to="/produtos">← Voltar ao catálogo</Link>
      <h1>{produto.nome}</h1>
      <img src={produto.imagem_url} alt={produto.nome} width="300" />
      <p>{produto.descricao}</p>
      <p>R$ {produto.preco}</p>

      <div>
        <label>Quantidade</label>
        <input
          type="number"
          min="1"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
      </div>

      <button onClick={handleAdicionar}>Adicionar ao orçamento</button>
    </div>
  );
}

export default ProdutoDetalhe;