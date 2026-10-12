import Atalhos from './Atalhos';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Atalhos />
      <Header />
      <main id="conteudo" className="layout__conteudo">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;