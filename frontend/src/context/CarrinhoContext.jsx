import { useState } from 'react';
import { CarrinhoContext } from './carrinho-context';

function chaveItem(produtoId, opcoesSelecionadas) {
  const ids = (opcoesSelecionadas ?? []).map((o) => o.id).sort((a, b) => a - b);
  return `${produtoId}-${ids.join(',')}`;
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionarItem(produto, quantidade, opcoesSelecionadas = []) {
    setItens((atual) => {
      const chave = chaveItem(produto.id, opcoesSelecionadas);
      const existente = atual.find((i) => chaveItem(i.produto.id, i.opcoesSelecionadas) === chave);
      if (existente) {
        return atual.map((i) =>
          i === existente ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...atual, { produto, quantidade, opcoesSelecionadas }];
    });
  }

  function removerItem(produtoId, opcoesSelecionadas = []) {
    const chave = chaveItem(produtoId, opcoesSelecionadas);
    setItens((atual) => atual.filter((i) => chaveItem(i.produto.id, i.opcoesSelecionadas) !== chave));
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
