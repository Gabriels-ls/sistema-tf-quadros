import { useState } from 'react';
import { CarrinhoContext } from './carrinho-context';

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionarItem(produto, quantidade, variacao = null) {
    setItens((atual) => {
      const existente = atual.find(
        (i) => i.produto.id === produto.id && (i.variacao?.id ?? null) === (variacao?.id ?? null)
      );
      if (existente) {
        return atual.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...atual, { produto, quantidade, variacao }];
    });
  }

  function removerItem(produtoId, variacaoId = null) {
    setItens((atual) =>
      atual.filter((i) => !(i.produto.id === produtoId && (i.variacao?.id ?? null) === variacaoId))
    );
  }

  function limparCarrinho() {
    setItens([]);
  }

  return (
    <CarrinhoContext.Provider value={{ itens, adicionarItem, removerItem, limparCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  );
}
