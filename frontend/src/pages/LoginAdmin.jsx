import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './LoginAdmin.css';

function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [entrando, setEntrando] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setEntrando(false);

    if (error) {
      setErro('E-mail ou senha inválidos.');
      return;
    }

    navigate('/admin');
  }

  return (
    <div className="login-pagina">
      <div className="login-caixa">
        <span className="login-marca">TF QUADROS</span>
        <h1 className="login-titulo">Acesso administrativo</h1>

        <form onSubmit={handleLogin} className="login-form">
          <div className="campo">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={entrando} className="btn-primario">
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;