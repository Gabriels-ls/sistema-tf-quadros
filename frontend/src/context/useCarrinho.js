import { useContext } from 'react';
import { CarrinhoContext } from './carrinho-context';

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
