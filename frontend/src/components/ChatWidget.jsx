import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import obterTokenCliente from '../services/clienteToken';
import { useChat } from '../context/useChat';
import './ChatWidget.css';

function ChatWidget() {
  const { mensagens, adicionarMensagem } = useChat();
  const [aberto, setAberto] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [enviando, setEnviando] = useState(false);
  const fimDasMensagensRef = useRef(null);

  useEffect(() => {
    fimDasMensagensRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  async function handleEnviar(e) {
    e.preventDefault();
    if (!entrada.trim()) return;

    const mensagemUsuario = entrada;
    adicionarMensagem('usuario', mensagemUsuario);
    setEntrada('');
    setEnviando(true);

    try {
      const token = obterTokenCliente();
      const resposta = await api.post('/chatbot', { mensagem: mensagemUsuario, token });

      adicionarMensagem('bot', resposta.data.resposta);
    } catch (err) {
      console.error(err);
      adicionarMensagem('bot', 'Desculpe, não consegui responder agora. Tente novamente em instantes.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="chat">
      {aberto && (
        <div className="chat__janela">
          <div className="chat__cabecalho">
            <strong>Atendimento TF Quadros</strong>
            <button
              onClick={() => setAberto(false)}
              className="chat__fechar"
              aria-label="Fechar o assistente virtual"
            >
              ✕
            </button>
          </div>

          <div className="chat__mensagens">
            {mensagens.map((msg, idx) => (
              <div
                key={idx}
                className={`chat__mensagem ${msg.autor === 'usuario' ? 'chat__mensagem--usuario' : ''}`}
              >
                <span className="chat__balao">{msg.texto}</span>
              </div>
            ))}
            {enviando && <div className="chat__digitando">Digitando...</div>}
            <div ref={fimDasMensagensRef} />
          </div>

          <form onSubmit={handleEnviar} className="chat__form">
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Digite sua mensagem..."
              aria-label="Mensagem para o assistente virtual"
              className="chat__entrada"
              disabled={enviando}
            />
            <button type="submit" disabled={enviando} className="chat__enviar">
              Enviar
            </button>
          </form>
        </div>
      )}

      {!aberto && (
        <button
          onClick={() => setAberto(true)}
          className="chat__abrir"
          aria-label="Abrir o assistente virtual"
        >
          💬
        </button>
      )}
    </div>
  );
}

export default ChatWidget;