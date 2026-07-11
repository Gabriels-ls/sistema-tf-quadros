import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function RotaProtegida({ children }) {
  const [carregando, setCarregando] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();
      setAutenticado(!!data.session);
      setCarregando(false);
    }

    verificarSessao();
  }, []);

  if (carregando) return <p>Verificando acesso...</p>;
  if (!autenticado) return <Navigate to="/login" />;

  return children;
}

export default RotaProtegida;