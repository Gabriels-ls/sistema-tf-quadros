import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container header__conteudo">
        <Link to="/" className="header__logo">TF QUADROS</Link>
        <nav className="header__nav">
          <Link to="/">Início</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/contato">Contate-nos</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;