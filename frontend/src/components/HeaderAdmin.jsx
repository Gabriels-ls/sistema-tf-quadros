import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function HeaderAdmin() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <strong>Painel Administrativo — TF Quadros</strong>
      <button onClick={handleLogout}>Sair</button>
    </header>
  );
}

export default HeaderAdmin;