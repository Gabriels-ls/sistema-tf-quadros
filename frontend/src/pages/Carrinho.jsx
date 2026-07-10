import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import api from '../services/api';
import obterTokenCliente from '../services/clienteToken';

function Carrinho() {
  const { itens, removerItem, limparCarrinho } = useCarrinho();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleEnviar(e) {
    e.preventDefault();
    setEnviando(true);

    try {
      const token = obterTokenCliente();

      await api.post('/orcamentos', {
        nome_cliente: nome,
        email_cliente: email,
        telefone_cliente: telefone,
        token,
        itens: itens.map((i) => ({ produto_id: i.produto.id, quantidade: i.quantidade })),
      });

      limparCarrinho();
      setSucesso(true);
    } catch (err) {
      console.error(err);
      alert('Não foi possível enviar a solicitação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div>
        <h1>Solicitação enviada!</h1>
        <p>Em breve entraremos em contato.</p>
        <Link to="/">Voltar ao catálogo</Link>
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div>
        <h1>Seu orçamento está vazio</h1>
        <Link to="/">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Seu orçamento</h1>
      <ul>
        {itens.map((item) => (
          <li key={item.produto.id}>
            {item.produto.nome} — Qtd: {item.quantidade}
            <button onClick={() => removerItem(item.produto.id)}>Remover</button>
          </li>
        ))}
      </ul>

      <h2>Seus dados</h2>
      <form onSubmit={handleEnviar}>
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
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar solicitação de orçamento'}
        </button>
      </form>
    </div>
  );
}

export default Carrinho;