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
          <nav id="menu" className="header-admin__nav" aria-label="Menu da área administrativa">
            <ul className="header-admin__menu">
              <li><Link to="/admin">Orçamentos</Link></li>
              <li><Link to="/admin/produtos">Produtos</Link></li>
            </ul>
          </nav>
        </div>
        <button onClick={handleLogout} className="header-admin__sair">Sair</button>
      </div>
    </header>
  );
}

export default HeaderAdmin;
