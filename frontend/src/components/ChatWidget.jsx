import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import obterTokenCliente from '../services/clienteToken';
import { useChat } from '../context/useChat';

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
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {aberto && (
        <div
          style={{
            width: '320px',
            height: '420px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            marginBottom: '10px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-navy)',
              color: '#fff',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>Atendimento TF Quadros</strong>
            <button
              onClick={() => setAberto(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            {mensagens.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.autor === 'usuario' ? 'right' : 'left',
                  margin: '6px 0',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: msg.autor === 'usuario' ? 'var(--color-primary)' : '#e4e6eb',
                    color: msg.autor === 'usuario' ? '#fff' : '#000',
                    maxWidth: '80%',
                  }}
                >
                  {msg.texto}
                </span>
              </div>
            ))}
            {enviando && (
              <div style={{ textAlign: 'left', margin: '6px 0', color: '#888' }}>
                Digitando...
              </div>
            )}
            <div ref={fimDasMensagensRef} />
          </div>

          <form onSubmit={handleEnviar} style={{ display: 'flex', borderTop: '1px solid #eee' }}>
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={{ flex: 1, border: 'none', padding: '10px', outline: 'none' }}
              disabled={enviando}
            />
            <button type="submit" disabled={enviando} style={{ padding: '0 16px', border: 'none', background: 'var(--color-primary)', color: '#fff' }}>
              Enviar
            </button>
          </form>
        </div>
      )}

      {!aberto && (
        <button
          onClick={() => setAberto(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}

export default ChatWidget;