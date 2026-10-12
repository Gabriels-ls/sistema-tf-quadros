import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/useCarrinho';
import { useChat } from '../context/useChat';
import api from '../services/api';
import obterTokenCliente from '../services/clienteToken';
import Layout from '../components/Layout';
import './Carrinho.css';

function Carrinho() {
  const { itens, removerItem, limparCarrinho } = useCarrinho();
  const { mensagens, limparConversa } = useChat();
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

      // Só envia o histórico se o cliente de fato escreveu algo no chat,
      // nunca para o bate-papo padrão (mensagem de boas-vindas do bot).
      const houveInteracao = mensagens.some((m) => m.autor === 'usuario');
      const historicoConversa = houveInteracao
        ? mensagens.map((m) => ({
            remetente: m.autor === 'usuario' ? 'cliente' : 'assistente',
            mensagem: m.texto,
          }))
        : undefined;

      await api.post('/orcamentos', {
        nome_cliente: nome,
        email_cliente: email,
        telefone_cliente: telefone,
        token,
        itens: itens.map((i) => ({
          produto_id: i.produto.id,
          quantidade: i.quantidade,
          opcoes_selecionadas: i.opcoesSelecionadas.map((o) => o.id),
        })),
        historicoConversa,
      });

      limparCarrinho();
      limparConversa();
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
      <Layout>
        <section className="container carrinho-status">
          <h1>Solicitação enviada!</h1>
          <p>Em breve entraremos em contato.</p>
          <Link to="/produtos" className="btn-primario">Voltar ao catálogo</Link>
        </section>
      </Layout>
    );
  }

  if (itens.length === 0) {
    return (
      <Layout>
        <section className="container carrinho-status">
          <h1>Seu orçamento está vazio</h1>
          <Link to="/produtos" className="btn-primario">Ver catálogo</Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container carrinho">
        <h1 className="carrinho__titulo">Seu orçamento</h1>

        <ul className="carrinho__itens">
          {itens.map((item) => {
            const chave = `${item.produto.id}-${item.opcoesSelecionadas.map((o) => o.id).join(',')}`;
            return (
              <li key={chave} className="carrinho__item">
                <div>
                  <strong>
                    {item.produto.nome}
                    {item.opcoesSelecionadas.length > 0
                      ? ` - ${item.opcoesSelecionadas.map((o) => o.nome).join(', ')}`
                      : ''}
                  </strong>
                  <span className="carrinho__item-qtd">Qtd: {item.quantidade}</span>
                </div>
                <button
                  onClick={() => removerItem(item.produto.id, item.opcoesSelecionadas)}
                  className="carrinho__remover"
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>

        <div className="carrinho__form-box">
          <h2 className="carrinho__subtitulo">Seus dados</h2>
          <form onSubmit={handleEnviar} className="carrinho__form">
            <fieldset className="grupo-campos carrinho__campos">
              <legend className="sr-only">Dados para contato</legend>
              <div className="campo">
                <label htmlFor="carrinho-nome">Nome</label>
                <input id="carrinho-nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="campo">
                <label htmlFor="carrinho-email">E-mail</label>
                <input
                  id="carrinho-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="carrinho-telefone">Telefone</label>
                <input id="carrinho-telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
            </fieldset>
            <button type="submit" disabled={enviando} className="btn-primario">
              {enviando ? 'Enviando...' : 'Enviar solicitação de orçamento'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}

export default Carrinho;