import { useNavigate, Link } from 'react-router-dom';
import { limparTokenAdmin } from '../services/adminAuth';
import './HeaderAdmin.css';

function HeaderAdmin() {
  const navigate = useNavigate();

  function handleLogout() {
    limparTokenAdmin();
    navigate('/login');
  }

  return (
    <header className="header-admin">
      <div className="container header-admin__conteudo">
        <div>
          <strong className="header-admin__marca">TF QUADROS — ADMIN</strong>
          <nav className="header-admin__nav">
            <Link to="/admin">Orçamentos</Link>
            <Link to="/admin/produtos">Produtos</Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="header-admin__sair">Sair</button>
      </div>
    </header>
  );
}

export default HeaderAdmin;
