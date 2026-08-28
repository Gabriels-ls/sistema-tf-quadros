import { useEffect, useState } from 'react';
import { ChatContext } from './chat-context';

const CHAVE_ARMAZENAMENTO = 'tfquadros_chat_mensagens';

const MENSAGEM_INICIAL = {
  autor: 'bot',
  texto: 'Olá! Sou o assistente virtual da TF Quadros. Como posso ajudar?',
};

function carregarMensagensSalvas() {
  const salvas = localStorage.getItem(CHAVE_ARMAZENAMENTO);
  return salvas ? JSON.parse(salvas) : [MENSAGEM_INICIAL];
}

export function ChatProvider({ children }) {
  const [mensagens, setMensagens] = useState(carregarMensagensSalvas);

  useEffect(() => {
    localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(mensagens));
  }, [mensagens]);

  function adicionarMensagem(autor, texto) {
    setMensagens((atual) => [...atual, { autor, texto }]);
  }

  function limparConversa() {
    setMensagens([MENSAGEM_INICIAL]);
  }

  return (
    <ChatContext.Provider value={{ mensagens, adicionarMensagem, limparConversa }}>
      {children}
    </ChatContext.Provider>
  );
}
