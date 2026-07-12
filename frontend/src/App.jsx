import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CarrinhoProvider } from './context/CarrinhoContext';
import Catalogo from './pages/Catalogo';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import Carrinho from './pages/Carrinho';
import LoginAdmin from './pages/LoginAdmin';
import Admin from './pages/Admin';
import AdminProdutos from './pages/AdminProdutos';
import RotaProtegida from './components/RotaProtegida';
import ChatWidget from './components/ChatWidget';

function ConteudoApp() {
  const location = useLocation();
  const esconderChat = location.pathname.startsWith('/admin') || location.pathname === '/login';

  return (
    <>
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
      {!esconderChat && <ChatWidget />}
    </>
  );
}

function App() {
  return (
    <CarrinhoProvider>
      <BrowserRouter>
        <ConteudoApp />
      </BrowserRouter>
    </CarrinhoProvider>
  );
}

export default App;