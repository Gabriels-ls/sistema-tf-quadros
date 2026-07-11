import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function HeaderAdmin() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <div>
        <strong>Painel Administrativo — TF Quadros</strong>
        <nav style={{ marginTop: '0.5rem' }}>
          <Link to="/admin" style={{ marginRight: '1rem' }}>Orçamentos</Link>
          <Link to="/admin/produtos">Produtos</Link>
        </nav>
      </div>
      <button onClick={handleLogout}>Sair</button>
    </header>
  );
}

export default HeaderAdmin;