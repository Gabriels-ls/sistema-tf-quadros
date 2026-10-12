import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container header__conteudo">
        <Link to="/" className="header__logo">TF QUADROS</Link>
        <nav id="menu" className="header__nav" aria-label="Menu principal">
          <ul className="header__menu">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/produtos">Produtos</Link></li>
            <li><Link to="/contato">Contate-nos</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;