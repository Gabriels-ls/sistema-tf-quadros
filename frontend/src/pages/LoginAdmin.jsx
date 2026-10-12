import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { salvarTokenAdmin } from '../services/adminAuth';
import Atalhos from '../components/Atalhos';
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

    try {
      const resposta = await api.post('/admin/login', { email, senha });
      salvarTokenAdmin(resposta.data.token);
      navigate('/admin');
    } catch {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setEntrando(false);
    }
  }

  return (
    <div className="login-pagina">
      <Atalhos itens={['conteudo']} />
      <main id="conteudo" className="login-caixa">
        <span className="login-marca">TF QUADROS</span>
        <h1 className="login-titulo">Acesso administrativo</h1>

        <form onSubmit={handleLogin} className="login-form">
          <fieldset className="grupo-campos login-campos">
            <legend className="sr-only">Dados de acesso</legend>
            <div className="campo">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="login-senha">Senha</label>
              <input
                id="login-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </fieldset>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" disabled={entrando} className="btn-primario">
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default LoginAdmin;
