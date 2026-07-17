import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './HeaderAdmin.css';

function HeaderAdmin() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
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