import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import obterTokenCliente from '../services/clienteToken';

function ProdutoDetalhe() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

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

  async function handleSolicitarOrcamento(e) {
    e.preventDefault();
    setEnviando(true);

    try {
      const token = obterTokenCliente();

      await api.post('/orcamentos', {
        nome_cliente: nome,
        email_cliente: email,
        telefone_cliente: telefone,
        produto_id: id,
        quantidade,
        token,
      });

      setSucesso(true);
    } catch (err) {
      console.error(err);
      alert('Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <p>Carregando produto...</p>;
  if (erro) return <p>{erro}</p>;

  return (
    <div>
      <Link to="/">← Voltar ao catálogo</Link>
      <h1>{produto.nome}</h1>
      <img src={produto.imagem_url} alt={produto.nome} width="300" />
      <p>{produto.descricao}</p>
      <p>R$ {produto.preco}</p>

      <hr />

      <h2>Solicitar orçamento</h2>

      {sucesso ? (
        <p>Solicitação enviada com sucesso! Em breve entraremos em contato.</p>
      ) : (
        <form onSubmit={handleSolicitarOrcamento}>
          <div>
            <label>Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div>
            <label>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Telefone</label>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
          <div>
            <label>Quantidade</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Solicitar orçamento'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProdutoDetalhe;