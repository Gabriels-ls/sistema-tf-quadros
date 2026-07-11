import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CarrinhoProvider } from './context/CarrinhoContext';
import Catalogo from './pages/Catalogo';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import Carrinho from './pages/Carrinho';
import LoginAdmin from './pages/LoginAdmin';
import Admin from './pages/Admin';
import AdminProdutos from './pages/AdminProdutos';
import RotaProtegida from './components/RotaProtegida';

function App() {
  return (
    <CarrinhoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route path="/login" element={<LoginAdmin />} />
          <Route
            path="/admin"
            element={
              <RotaProtegida>
                <Admin />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin/produtos"
            element={
              <RotaProtegida>
                <AdminProdutos />
              </RotaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </CarrinhoProvider>
  );
}

export default App;